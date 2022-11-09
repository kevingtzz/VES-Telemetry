#include "constants.h"
#include <SPI.h>
#include <LoRa.h>

unsigned int input_led_current_time = 0;
unsigned int input_led_final_time = 0;

void setup() {
  Serial.begin(SERIAL_BAUD_RATE);
  pinMode(LORA_INPUT_LED, OUTPUT);
  pinMode(LORA_STATUS_LED, OUTPUT);
//  while (!Serial) ; // Wait for serial port to be available

  LoRa.setPins(LORA_CS_PIN, LORA_RESET_PIN, LORA_IRQ_PIN);
  if (!LoRa.begin(LORA_FREQUENCY)) {
    Serial.println("Starting LoRa failed!");
    while (1);
  }
  digitalWrite(LORA_STATUS_LED, HIGH);
  Serial.println("Starting LoRa Successfull!");
}

void loop() {
  input_led_current_time = millis();
  
  int packetSize = LoRa.parsePacket();
  if (packetSize) {
    if (LoRa.read() == NETWORK_ID) {
//      if (LoRa.read() == TRANSMITTER_ADDRESS) {
        if (LoRa.read() == COORDINATOR_ADDRESS) {
          digitalWrite(LORA_INPUT_LED, HIGH);
        int length_data = LoRa.read();
        byte data[length_data] = { 0 };
        int index = 0;  
        while (LoRa.available()) {
          data[index] = LoRa.read();
          index++;
        }
        Serial.write(data, length_data);
      }
    }  
  }
  if (input_led_current_time - input_led_final_time > 1000) {
    digitalWrite(LORA_INPUT_LED, LOW);
    input_led_final_time = input_led_current_time;  
  }
}
