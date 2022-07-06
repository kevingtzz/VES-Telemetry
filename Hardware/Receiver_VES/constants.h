//========================== Pins ==============================//

#define LORA_CS_PIN 4
#define LORA_RESET_PIN 7
#define LORA_IRQ_PIN 2 // must be a hardware interrupt pin (GPIO 0)
#define LORA_STATUS_LED 3
#define LORA_INPUT_LED 5

//========================== Settings ==============================//

#define SERIAL_BAUD_RATE 9600
#define DATA_LENGTH 18

//========================== Mesh settings ========================//

#define TRANSMITTER_ADDRESS 1
#define COORDINATOR_ADDRESS 2
#define RECEIVER_ADDRESS 3
