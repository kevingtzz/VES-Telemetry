/*
End-device(Trnasmissor) LoRa code for VES Telemtry.
@Author: Kevin Gutierrez Gomez.
@Date: December 11th 2021.
*/

#include <Arduino.h>
#include <SPI.h>
#include <LoRa.h>
#include <mcp_can.h>
#include <constants.h>

MCP_CAN CAN(CAN_SPI_CS_PIN);
byte data[DATA_LENGTH] = { 0 };

unsigned int current_time = 0;
unsigned int final_time = 0;

void fill_data_can() {
  unsigned char len = 0;
  unsigned char buf[8];

  CAN.readMsgBuf(&len, buf);

  unsigned long canId = CAN.getCanId();

  Serial.println("-----------------------------");
  Serial.print("Data from ID: 0x");
  Serial.println(canId, HEX);
  Serial.println();

  if (canId == 0x3CB) {
    data[0] = buf[2]; // most significant minVolt byte
    data[1] = buf[3]; // least significant minVolt byte
    data[2] = buf[4]; // most significant maxVolt byte
    data[3] = buf[5]; // least significant maxVolt byte
  }
  if (canId == 0x3B) {
    data[4] = buf[0]; // most significant current byte
    data[5] = buf[1]; // least significant current byte
    data[6] = buf[2]; // most significant instantVolt byte
    data[7] = buf[3]; // least significant instantVolt byte
    data[8] = buf[6]; // SOC
  }
}

void fill_test_data() {
  data[0] = 0x00;
  data[1] = 0x01;
  data[2] = 0x02;
  data[3] = 0x03;
  data[4] = 0x04;
  data[5] = 0x05;
  data[6] = 0x06;
  data[7] = 0x07;
  data[8] = 0x08;
}

void send() {
  Serial.print("Sending packat...");
  Serial.println();
  LoRa.beginPacket();
  LoRa.write(data, DATA_LENGTH);
  LoRa.endPacket();
}

void setup() {
  Serial.begin(SERIAL_BAUD_RATE);

  while (CAN_OK != CAN.begin(CAN_500KBPS)) {
    Serial.println("CAN BUS init Failed");
    delay(100);
  }
  Serial.println("CAN BUS Shield Init OK!");

  LoRa.setPins(LORA_CS_PIN, LORA_RESET_PIN, LORA_IRQ_PIN);

  Serial.println("Initializing LoRa module...");
  if (!LoRa.begin(LORA_FREQUENCY)) {
    Serial.println("Starting LoRa failed!");
    while (1);
  }
}

void loop() {
  if (CAN_MSGAVAIL == CAN.checkReceive()) {
    fill_data_can();
  }

  fill_test_data();

  current_time = millis();
  if (current_time - final_time > 1000) {
    send();
    memset(data, 0, DATA_LENGTH); // reset data vecto to 0
    final_time = current_time;
  }
}