#include <Arduino.h>
#include <ArduinoJson.h>
#include <SPI.h>
#include <LoRa.h>
#include <constants.h>

byte data[DATA_LENGTH] = { 0 };

float minVolt, maxVolt, current, instantVolt;
int soc;

const int JSON_CAPACITY = JSON_OBJECT_SIZE(6);
StaticJsonDocument<JSON_CAPACITY> doc;
char json[128];

void set_json(int rssi) {
  doc["minVolt"] = (((float)(data[0] << 8) + (float)data[1])) / 1000;
  doc["maxVolt"] = ((float)(data[2] << 8) + (float)data[3]) / 1000;
  doc["current"] = ((float)(data[4] << 8) + (float)data[5]) / 10;
  doc["instantVolt"] = ((float)(data[6] << 8) + (float)data[7]) / 10;
  doc["soc"] = (int)data[8];
  doc["rssi"] = rssi;
  serializeJson(doc, json);
}

void setup() {
  Serial.begin(SERIAL_BAUD_RATE);

  LoRa.setPins(LORA_CS_PIN, LORA_RESET_PIN, LORA_IRQ_PIN);

  if (!LoRa.begin(LORA_FREQUENCY)) {
    Serial.println("Starting LoRa failed!");
    while (1);
  }
}

void loop() {
  if (LoRa.parsePacket()) {
    while (LoRa.available()) {
      int index = DATA_LENGTH - LoRa.available();
      data[index] = LoRa.read();
    }
    set_json(LoRa.packetRssi());
    Serial.write(json);
  }
}