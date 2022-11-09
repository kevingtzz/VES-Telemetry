//========================== Pins ==============================//

#define CAN_SPI_CS_PIN 10
#define LORA_CS_PIN 8
#define LORA_RESET_PIN 9
#define LORA_IRQ_PIN 2
#define LORA_STATUS_LED 3
#define MCP_STATUS_LED 4
#define GPS_RX_PIN 5
#define GPS_TX_PIN 6

//========================== Settings ==============================//

#define SERIAL_BAUD_RATE 9600
#define GPS_BAUD_RATE 9600
#define DATA_LENGTH 26
#define FRAME_LENGTH DATA_LENGTH + 3

//========================== Mesh settings ========================//

#define LORA_FREQUENCY 433E6
#define TRANSMITTER_ADDRESS 0x1
#define COORDINATOR_ADDRESS 0x2
#define RECEIVER_ADDRESS 0x3
#define NETWORK_ID 0x7
