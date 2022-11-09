const { ipcMain } = require('electron');

ipcMain.on('get variables', (event) => {
    let variables = [
        'speed',
        'minVolt',
        'maxVolt',
        'current',
        'instantVolt',
        'soc',
        'maxTemp',
        'minTemp'
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
    if(data.maxVolt > 4.5) data.maxVolt = 0;
    data.minTemp = bufferArray[4];
    data.maxTemp = bufferArray[5];
    data.current = parseTwoBytes(bufferArray[6], bufferArray[7])/10;
    if(data.current > 400) data.current = 0;
    data.instantVolt = parseTwoBytes(bufferArray[8], bufferArray[9])/10;
    if(data.instantVolt > 110) data.instantVolt = 0;
    data.ampersH = parseTwoBytes(bufferArray[10], bufferArray[11])/10;
    data.soc = bufferArray[12];
    if(data.soc > 100) data.soc = 0;
    data.releyStatus = bufferArray[13];
    data.avgTemp = bufferArray[14]*2;
    data.nominalVolt = parseTwoBytes(bufferArray[15], bufferArray[16]);
    data.satellites = bufferArray[17];
    data.latitude = parseCoordinate(bufferArray[18], bufferArray[19], bufferArray[20], bufferArray[21]);
    data.longitude = parseCoordinate(bufferArray[22], bufferArray[23], bufferArray[24], bufferArray[25]);
    console.log(`${bufferArray[22]}, ${bufferArray[23]}, ${bufferArray[24]}, ${bufferArray[25]}`)
    console.log(data);
    return data;
}

exports = {
    parseTwoBytes
}