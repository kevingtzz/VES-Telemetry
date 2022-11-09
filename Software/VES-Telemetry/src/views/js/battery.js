const { ipcRenderer } = require('electron');

soc = 0;
instantVolt = 0;
minVolt = 0;
maxVolt = 0;
current = 0;

socField = document.getElementById('soc');
socBar = document.getElementById('socBar');
instantVolt_value = document.getElementById('instantVolt_value');
minVolt_value = document.getElementById('minVolt_value');
maxVolt_value = document.getElementById('maxVolt_value');
current_value = document.getElementById('current_value');
ampers_hour = document.getElementById('ampers_h_value');
avg_temp = document.getElementById('avg_temp_value');
max_temp = document.getElementById('max_temp_value');
min_temp = document.getElementById('min_temp_value');

ipcRenderer.on('serial_data', (event, data) => {
    console.log(data.soc);
    soc = data.soc;
    socField.innerHTML = `${data.soc}%`;
    socBar.style.width = `${data.soc}%`; //level of progress bar
    instantVolt_value.innerHTML = `${data.instantVolt}`;
    minVolt_value.innerHTML = `${data.minVolt}`;
    maxVolt_value.innerHTML = `${data.maxVolt}`;
    current_value.innerHTML = `${data.current}`;
    ampers_hour.innerHTML = `${data.ampersH}`;
    avg_temp.innerHTML = `${data.avgTemp}`;
    max_temp.innerHTML = `${data.maxTemp}`;
    min_temp.innerHTML = `${data.minTemp}`;
});