const SerialPort = require('serialport');

const connect = setInterval(connect_receiver, 1000);

function connect_receiver() {
    console.log('Scanning ports...');
    SerialPort.list().then(ports => {
        ports.forEach(port => {
            console.log(port.manufacturer);
            if (port.manufacturer != undefined && port.manufacturer.includes('SparkFun')) { //'SparkFun' id of the Arduino pro micro manufacturer
                port = new SerialPort(port.path, {
                    baudRate: 9600
                });

                port.on('open', () => {
                    console.log('Serial port opened.');
                    clearInterval(connect);
                });

                port.on('error', err => {
                    console.log('Error: ', err.message);
                });

                port.on('data', data => {
                    data = data.toString();
                    data = data.replace(/\r?\n|\r/g, "");
                    data = JSON.stringify(data);
                    data = JSON.parse(data);
                    console.log(data);
                })

                port.on('close', function() {
                    console.log('Serial port closed.');
                    connect = setInterval(connect_receiver, 1000);
                    return;
                });
            } 
        });
    });
}