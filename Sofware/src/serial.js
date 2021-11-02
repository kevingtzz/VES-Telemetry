const {ipcMain} = require('electron');
const {parse_data} = require('./parser.js');
const SerialPort = require('serialport');
const xbee_api = require('xbee-api');
const database = require('./database.js');

var xbeeAPI = new xbee_api.XBeeAPI({
    api_mode: 2
});

let mainWindow = null;
let batteryWindow = null;
let graphWindows = [];
let connect = setInterval(connect_xbee, 1000);

function connect_xbee() {
    console.log('Scanning ports...');
    SerialPort.list().then(ports => {
        ports.forEach(port => {
            if (port.manufacturer != undefined && port.manufacturer.includes('FTDI')) { //'FTDI' id the xbee explorer manufacturer
                port = new SerialPort(port.path, {
                    baudRate: 115200,
                    parser: xbeeAPI.rawParser()
                });

                port.on('error', function(err) {
                    console.log('Error: ', err.message);
                });

                port.on('open', () => {
                    console.log('Serial port opened.');
                    clearInterval(connect);
                    mainWindow.webContents.send('serial_connected', true);
                });

                port.pipe(xbeeAPI.parser);

                xbeeAPI.parser.on("data", function(frame) {
                    let data = parse_data(frame.data);

                    if (database.get_recording_state()) {
                        database.insert(data);
                    }
                    
                    if (mainWindow !== null) mainWindow.webContents.send('serial_data', data);
                    if (batteryWindow !== null) batteryWindow.webContents.send('serial_data', data);

                    graphWindows.forEach(window => {
                        try {
                            window.webContents.send('serial data', data);
                        } catch (error) {
                            //console.log(error);
                        }
                    });
                });

                port.on('close', function() {
                    console.log('close');
                    connect = setInterval(connect_xbee, 1000);
                    mainWindow.webContents.send('serial_connected', false);
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