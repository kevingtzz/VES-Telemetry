const { ipcMain } = require('electron');

ipcMain.on('get variables', (event) => {
    let variables = [
        'speed',
        'minVolt',
        'maxVolt',
        'current',
        'instantVolt',
        'soc'
    ];
    event.reply('variables', variables);
});

function parseTwoBytes(byte0, byte1) {
    //Big-Endian format
    let value;
    value = 0x00FF&byte1;
    value = (byte0 << 8) | value;
    return value;
}

function parseCoordinate(byte0, byte1, byte2, byte3) {
    let coordinate;
    coordinate = 0x000000FF&byte0;
    coordinate = (byte1 << 8) | coordinate;
    coordinate = (byte2 << 16) | coordinate;
    coordinate = (byte3 << 24) | coordinate;
    return coordinate / Math.pow(10, 6);
}

module.exports.dataToJson = function(bufferArray) {
    let data = {};
    data.timestamp = new Date();
    data.minVolt = parseTwoBytes(bufferArray[0], bufferArray[1])/1000;
    data.maxVolt = parseTwoBytes(bufferArray[2], bufferArray[3])/1000;
    data.current = parseTwoBytes(bufferArray[4], bufferArray[5])/10;
    data.instantVolt = parseTwoBytes(bufferArray[6], bufferArray[7])/10;
    data.soc = bufferArray[8];
    data.satellites = bufferArray[9];
    data.latitude = parseCoordinate(bufferArray[10], bufferArray[11], bufferArray[12], bufferArray[13]);
    data.longitude = parseCoordinate(bufferArray[14], bufferArray[15], bufferArray[16], bufferArray[17]);

    return data;
}