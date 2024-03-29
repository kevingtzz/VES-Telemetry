const {ipcMain} = require('electron');
const SerialPort = require('serialport');
const { dataToJson, parseTwoBytes } = require('./parser.js');
const database = require('./database');

let mainWindow = null;
let batteryWindow = null;
let graphWindows = [];
let graph_variables = null;
const connect = setInterval(connect_receiver, 1000);

function connect_receiver() {
    console.log('Scanning ports...');
    SerialPort.list().then(ports => {
        ports.forEach(port => {
            if (port.manufacturer != undefined && port.manufacturer.includes('SparkFun')) { //'SparkFun' id of the Arduino pro micro manufacturer
                port = new SerialPort(port.path, {
                    baudRate: 9600
                });

                port.on('open', () => {
                    console.log('Serial port opened.');
                    clearInterval(connect);
                    mainWindow.webContents.send('serial_connected', true);
                });

                port.on('error', err => {
                    console.log('Error: ', err.message);
                });

                port.on('readable', () => {
                    buffer = port.read();
                    bufferArray = [...buffer];
                    data = dataToJson(bufferArray);
                    try {
                        if (bufferArray[12] <= 100 || ((parseTwoBytes(bufferArray[2], bufferArray[3])/1000) <= 4.5 )) { // this is a countermessure for the corrupted data. once the data will cleaned by hardware this conditional must be deleted.
                            if (mainWindow !== null) mainWindow.webContents.send('serial_data', data);
                            if (batteryWindow !== null) batteryWindow.webContents.send('serial_data', data);
                            if (database.getRecordingState()) database.insert(data);
    
                            graphWindows.forEach(window => {
                                try {
                                    window.webContents.send('serial data', data);
                                } catch (error) {
                                    // console.log(error);
                                }
                            });
                        }
                    } catch (error) {
                        console.log(error);
                    }
                });

                port.on('close', function() {
                    console.log('Serial port closed.');
                    connect = setInterval(connect_receiver, 1000);
                    return;
                });
            } 
        });
    });
}

function set_mainWindow(window) {
    mainWindow = window;
}

function set_batteryWindow(window) {
    batteryWindow = window;
}

function add_graphWindow(window) {
    graphWindows.push(window);
}

module.exports = {
    set_mainWindow,
    set_batteryWindow,
    add_graphWindow
}