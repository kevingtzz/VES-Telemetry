#include <SPI.h>
#include <LoRa.h>
#include "constants.h"

void setup() {
  Serial.begin(SERIAL_BAUD_RATE);

  LoRa.setPins(LORA_CS_PIN, LORA_RESET_PIN, LORA_IRQ_PIN);

  if (!LoRa.begin(LORA_FREQUENCY)) {
    while (1);
    Serial.println("LoRa init failed!!");
  }
  Serial.println("lora_ok");
}

void loop() {
 if(LoRa.parsePacket(3)) {
  if(LoRa.read() == NETWORK) {
    Serial.print("data: ");
    while(LoRa.available()) {
      Serial.print(LoRa.read());
      Serial.print(", ");
    }
    Serial.print(LoRa.rssi());
    Serial.println(""); 
  }
 }
}
