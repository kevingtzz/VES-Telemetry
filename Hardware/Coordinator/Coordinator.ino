#include <SPI.h>
#include <LoRa.h>
#include "constants.h"

unsigned int input_led_current_time = 0;
unsigned int input_led_final_time = 0;

void fillFrame(byte frame[], int data_length, int frame_length, byte data[]) {
  frame[0] = NETWORK_ID;
  frame[1] = COORDINATOR_ADDRESS;
  frame[2] = data_length;
  for (int i = 3; i < frame_length; i++) {
    frame[i] = data[i - 3];
  }
//  frame[FRAME_LENGTH - 1] = checksum(data);
}

void send_frame(byte frame[], int frame_length) {
//  printFrame();
  Serial.println("Sending package...");
  LoRa.beginPacket();
  LoRa.write(frame, frame_length);
  LoRa.endPacket();
}

void setup() {
  pinMode(LORA_INPUT_LED, OUTPUT);
  pinMode(LORA_STATUS_LED, OUTPUT);
  Serial.begin(SERIAL_BAUD_RATE);

  LoRa.setPins(LORA_CS_PIN, LORA_RESET_PIN, LORA_IRQ_PIN);
  if (!LoRa.begin(LORA_FREQUENCY)) {
    while (1);
    Serial.println("LoRa init failed!!");
  }
  Serial.println("Starting LoRa Successfull!");
  digitalWrite(LORA_STATUS_LED, HIGH);
}

void loop() {
  input_led_current_time = millis();
  int packetSize = LoRa.parsePacket();
  if (packetSize) {
    if (LoRa.read() == NETWORK_ID) {
      if (LoRa.read() == TRANSMITTER_ADDRESS) {
        digitalWrite(LORA_INPUT_LED, HIGH);
        int data_length = LoRa.read();
        int frame_length = data_length + 3;
        byte data[data_length] = { 0 };
        int index = 0;  
        while (LoRa.available()) {
          data[index] = LoRa.read();
          index++;
        }
        byte frame[data_length] = { 0 };
        fillFrame(frame, data_length, frame_length, data);
        send_frame(frame, frame_length);
      }
    }  
  }

  if (input_led_current_time - input_led_final_time > 1000) {
    digitalWrite(LORA_INPUT_LED, LOW);
    input_led_final_time = input_led_current_time;  
  }
}
