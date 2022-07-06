#include "constants.h"
#include <SPI.h>
#include <mcp_can.h>
#include <RHRouter.h>
#include <RH_RF95.h>
//#include <TinyGPSPlus.h>
//#include <SoftwareSerial.h>

MCP_CAN CAN(CAN_SPI_CS_PIN);
byte data[DATA_LENGTH] = { 0 };
byte buf[DATA_LENGTH];

// Singleton instance of the radio driver
RH_RF95 driver(LORA_CS_PIN, LORA_IRQ_PIN); // params: NSS spi, irq pin

// Class to manage message delivery and receipt, using the driver declared above
RHRouter manager(driver, TRANSMITTER_ADDRESS);

//TinyGPSPlus gps;
//SoftwareSerial gps_ss(GPS_RX_PIN, GPS_TX_PIN);

//long lat = 0;
//long lng = 0;

unsigned int current_time = 0;
unsigned int final_time = 0;

void fill_data_can() {
  unsigned char len = 0;
  unsigned char buf[8];

  CAN.readMsgBuf(&len, buf);

  unsigned long canId = CAN.getCanId();
  Serial.println(canId);

  if (canId == 0x3CB) {
    Serial.println("0x3CB data");
    data[0] = buf[2]; // most significant minVolt byte
    data[1] = buf[3]; // least significant minVolt byte
    data[2] = buf[4]; // most significant maxVolt byte
    data[3] = buf[5]; // least significant maxVolt byte
  }
  if (canId == 0x03B) {
    Serial.println("0x03B data");
    data[4] = buf[0]; // most significant current byte
    data[5] = buf[1]; // least significant current byte
    data[6] = buf[2]; // most significant instantVolt byte
    data[7] = buf[3]; // least significant instantVolt byte
    data[8] = buf[6]; // SOC
  }
}
//
//void fill_data_gps() {
//  while(gps_ss.available() > 0) {
//    gps.encode(gps_ss.read());
//  }
//  if (gps.satellites.isValid() && gps.satellites.isUpdated()) {
//    data[9] = gps.satellites.value();
//  } else if (gps.location.isValid() && gps.location.isUpdated()) {
//    lat = gps.location.lat()*pow(10, 6);
//    lng = gps.location.lng()*pow(10, 6);
//    data[10] = (0x000000FF)&lat;
//    data[11] = ((0x0000FF00)&lat) >> 8;
//    data[12] = ((0x00FF0000)&lat) >> 16;
//    data[13] = ((0xFF000000)&lat) >> 24;
//    data[14] = (0x000000FF)&lng;
//    data[15] = ((0x0000FF00)&lng) >> 8;
//    data[16] = ((0x00FF0000)&lng) >> 16;
//    data[17] = ((0xFF000000)&lng) >> 24;
//  }
//}

void send() {
  Serial.println("Sending package...");
  // A route to the destination will be automatically discovered.
  if (manager.sendtoWait(data, DATA_LENGTH, RECEIVER_ADDRESS) == RH_ROUTER_ERROR_NONE) {
    // It has been reliably delivered to the next node.
    Serial.println("Package sent.");
    uint8_t len = DATA_LENGTH;
    uint8_t from; 
    
    if (manager.recvfromAckTimeout(buf, &len, 3000, &from)) {
      Serial.print("got reply from : 0x");
      Serial.print(from, HEX);
      Serial.print(": ");
      Serial.println((char*)buf);
    }
  } else {
    Serial.println("Delivery failed.");  
  }
}

void setup() {
//  pinMode(LORA_STATUS_LED, OUTPUT);
//  pinMode(MCP_STATUS_LED, OUTPUT);
//  pinMode(2, INPUT);

  Serial.begin(SERIAL_BAUD_RATE);
  while(!Serial);
//  gps_ss.begin(GPS_BAUD_RATE);

  if (!manager.init()) {
    Serial.println("LoRa driver init failed.");  
  } else {
    Serial.print("LoRa init ok.");
  }
// Defaults after init are 434.0MHz, 13dBm, Bw = 125 kHz, Cr = 4/5, Sf = 128chips/symbol, CRC on

  driver.setTxPower(20);

  // Manually define the routes for this network
  manager.addRouteTo(COORDINATOR_ADDRESS, COORDINATOR_ADDRESS);
  manager.addRouteTo(RECEIVER_ADDRESS, COORDINATOR_ADDRESS);

  while (CAN_OK != CAN.begin(CAN_500KBPS)) {
    Serial.println("CAN init failed!!");
    delay(100);
  }
  Serial.println("CAN ok");
//  digitalWrite(MCP_STATUS_LED, 1);
}

void loop() {
  if (CAN_MSGAVAIL == CAN.checkReceive()) {
    fill_data_can();
  }

//  if (gps_ss.available() > 0) {
//      fill_data_gps();
//  }

  current_time = millis();
  if (current_time - final_time > 1000) {
    send();
//    manager.printRoutingTable();
    memset(data, 0, DATA_LENGTH); // reset data vecto to 0
    final_time = current_time;
  }
}
