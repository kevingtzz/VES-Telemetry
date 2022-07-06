#include "constants.h"
#include <SPI.h>
#include <RHRouter.h>
#include <RH_RF95.h>
 
RH_RF95 driver(LORA_CS_PIN, LORA_IRQ_PIN);
// Class to manage message delivery and receipt, using the driver declared above
RHRouter manager(driver, RECEIVER_ADDRESS);

byte data[DATA_LENGTH] = { 0 };
byte buf[DATA_LENGTH];

void setup() {
    
  Serial.begin(9600);
  while (!Serial) ; // Wait for serial port to be available
  if (!manager.init())
    Serial.println("init failed");  
  // Defaults after init are 434.0MHz, 13dBm, Bw = 125 kHz, Cr = 4/5, Sf = 128chips/symbol, CRC on
  
  driver.setTxPower(20);

  // Manually define the routes for this network
  manager.addRouteTo(TRANSMITTER_ADDRESS, COORDINATOR_ADDRESS);  
//  manager.addRouteTo(SERVER2_ADDRESS, SERVER2_ADDRESS);
//  manager.addRouteTo(SERVER3_ADDRESS, SERVER2_ADDRESS);
}
 
uint8_t res[] = "And hello back to you from RECEIVER";

void loop() {
  uint8_t len = sizeof(buf);
  uint8_t from;
  if (manager.recvfromAck(buf, &len, &from)) {
    Serial.print("Data arrive!!  :  ");
    
    if (manager.sendtoWait(res, DATA_LENGTH, from) != RH_ROUTER_ERROR_NONE) {
    // It has been reliably delivered to the next node.
    Serial.println("Package sent.");
    Serial.println(driver.lastRssi());
  } else {
    Serial.println("Delivery failed.");  
  }
//    manager.getRouteTo(3);
//    manager.printRoutingTable();
    Serial.write(data, DATA_LENGTH);
  }
}
