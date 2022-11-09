#include "constants.h"
#include <SPI.h>
#include <mcp_can.h>
#include <LoRa.h>
#include <TinyGPSPlus.h>
#include <SoftwareSerial.h>

MCP_CAN CAN(CAN_SPI_CS_PIN);
byte data[DATA_LENGTH] = { 0 };
byte frame[FRAME_LENGTH] = { 0 };
byte buf[DATA_LENGTH];

TinyGPSPlus gps;
SoftwareSerial gps_ss(GPS_RX_PIN, GPS_TX_PIN);

long lat = 0;
long lng = 0;

unsigned int current_time = 0;
unsigned int led_lora_current_time = 0;
unsigned int final_time = 0;
unsigned int led_lora_final_time = 0;

void fill_data_can() {
  unsigned char len = 0;
  unsigned char buf[8];

  CAN.readMsgBuf(&len, buf);

  unsigned long canId = CAN.getCanId();
//  Serial.println(canId);

  if (canId == 0x3CB) {
//    Serial.println("0x3CB data");
    data[0] = buf[2]; // most significant minVolt byte
    data[1] = buf[3]; // least significant minVolt byte
    data[2] = buf[4]; // most significant maxVolt byte
    data[3] = buf[5]; // least significant maxVolt byte
    data[4] = buf[6]; // minimum temperature
    data[5] = buf[7]; // maximum temperature
  }
  if (canId == 0x03B) {
//    Serial.println("0x03B data");
    data[6] = buf[0]; // most significant current byte
    data[7] = buf[1]; // least significant current byte
    data[8] = buf[2]; // most significant instantVolt byte
    data[9] = buf[3]; // least significant instantVolt byte
    data[10] = buf[4]; // Ampers per hour most significant byte
    data[11] = buf[5]; // Ampers per hour least significant byte
    data[12] = buf[6]; // SOC
  }
  if (canId == 0x653) {
//    Serial.println("0x653 data");
    data[13] = buf[0]; // reley status
    data[14] = buf[4]; // average temp - div by 2
  }
  if (canId == 0x651) {
//    Serial.println("0x651 data");
    data[15] = buf[4]; // Nominal volt most significant byte
    data[16] = buf[5]; // Nominal volt leat significant byte
  }
  if (canId == 0x3A) {
    Serial.println("0x03A data");
  }
}

void fill_data_gps() {
  while(gps_ss.available() > 0) {
    gps.encode(gps_ss.read());
  }
  if (gps.satellites.isValid() && gps.satellites.isUpdated()) {
    data[17] = gps.satellites.value();
  } else if (gps.location.isValid() && gps.location.isUpdated()) {
    lat = gps.location.lat()*pow(10, 6);
    lng = gps.location.lng()*pow(10, 6);
    data[18] = (0x000000FF)&lat;
    data[19] = ((0x0000FF00)&lat) >> 8;
    data[20] = ((0x00FF0000)&lat) >> 16;
    data[21] = ((0xFF000000)&lat) >> 24;
    data[22] = (0x000000FF)&lng;
    Serial.print(data[22]);
    Serial.print(",");
    data[23] = ((0x0000FF00)&lng) >> 8;
    Serial.print(data[23]);
    Serial.print(",");
    data[24] = ((0x00FF0000)&lng) >> 16;
    Serial.print(data[24]);
    Serial.print(",");
    data[25] = ((0xFF000000)&lng) >> 24;
    Serial.print(data[25]);
    Serial.println("");
  }
}

void fillDataTest() {
  data[0] = 0x03;
  data[12] = 50;
  data[DATA_LENGTH - 1] = 0x03;
}

//byte checksum(byte data[]) {
//  byte checksum = 0x00;
//  for (int i = 0; i < DATA_LENGTH; i++) {
//      checksum += data[i];
//  }
//  return checksum;
//}

void fillFrame() {
  frame[0] = NETWORK_ID;
  frame[1] = TRANSMITTER_ADDRESS;
  frame[2] = DATA_LENGTH;
  for (int i = 3; i < FRAME_LENGTH; i++) {
    frame[i] = data[i - 3];
  }
//  frame[FRAME_LENGTH - 1] = checksum(data);
}

void sendFrame() {
  digitalWrite(LORA_STATUS_LED, HIGH);
  
  fillFrame();
//  printFrame();
  Serial.println("Sending package...");
  LoRa.beginPacket();
  LoRa.write(frame, FRAME_LENGTH);
  LoRa.endPacket();
}

//void printFrame() {
//  Serial.print("CheckSum: ");
//  Serial.println(frame[FRAME_LENGTH - 1]);
//}

void setup() {
  pinMode(LORA_STATUS_LED, OUTPUT);
  pinMode(MCP_STATUS_LED, OUTPUT);
//  pinMode(2, INPUT);

  LoRa.setPins(LORA_CS_PIN, LORA_RESET_PIN, LORA_IRQ_PIN);

  Serial.begin(SERIAL_BAUD_RATE);
  while(!Serial);
  gps_ss.begin(GPS_BAUD_RATE);

  if (!LoRa.begin(LORA_FREQUENCY)) {
    Serial.println("Starting LoRa failed!");
    while (1);
  }
  Serial.println("Starting LoRa Successfull!");
  digitalWrite(LORA_STATUS_LED, HIGH);
  LoRa.setTxPower(20);

  while (CAN_OK != CAN.begin(CAN_500KBPS)) {
    Serial.println("CAN init failed!!");
    delay(100);
  }
  Serial.println("CAN ok");
  digitalWrite(MCP_STATUS_LED, HIGH);
}

void loop() {
  if (CAN_MSGAVAIL == CAN.checkReceive()) {
    fill_data_can();
  }

  if (gps_ss.available() > 0) {
      fill_data_gps();
  }

  current_time = millis();
  led_lora_current_time = millis();
  
  if (current_time - final_time > 500) {
//    fillDataTest();
    sendFrame();
    memset(data, 0, DATA_LENGTH); // reset data vecto to 0
    final_time = current_time;
  }

  if (led_lora_current_time - led_lora_final_time > 1000) {
    digitalWrite(LORA_STATUS_LED, LOW);
    led_lora_final_time = led_lora_current_time;  
  }
}
