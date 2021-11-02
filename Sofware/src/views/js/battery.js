const { ipcRenderer } = require('electron');

soc = 0;
instantVolt = 0;
minVolt = 0;
current = 0;

socField = document.getElementById('soc');
socBar = document.getElementById('socBar');
instantVolt_value = document.getElementById('instantVolt_value');
minVolt_value = document.getElementById('minVolt_value');
current_value = document.getElementById('current_value');

ipcRenderer.on('serial_data', (event, data) => {
    soc = data.soc;
    socField.innerHTML = `${data.soc}%`;
    socBar.style.width = `${data.soc}%`; //level of progress bar
    instantVolt_value.innerHTML = `${data.instantVolt}`;
    minVolt_value.innerHTML = `${data.minVolt}`;
    current_value.innerHTML = `${data.current}`;
});

