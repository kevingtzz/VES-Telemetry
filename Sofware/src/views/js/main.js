const {ipcRenderer} = require('electron');

var database_button = document.getElementById('database_button');
var battery_button = document.getElementById('battery');
var general_button = document.getElementById('general');
var graph_button = document.getElementById('graph');
var serial_indicator = document.getElementById('serial_indicator');
var database_indicator = document.getElementById('database_indicator');
var map;
var marker = null;
let serial_connection = false;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 0.000000, lng: 0.000000},
        zoom: 2
    });
}

function set_serial_indicator(state) {
    serial_indicator.style.backgroundColor = (state) ? 'rgba(48, 190, 55, 0.7)' : 'rgba(165, 165, 165, .7)';
}

function set_database_indicator(state) {
    database_indicator.style.backgroundColor = (state) ? 'rgba(53, 152, 233, 0.9)' : 'rgba(165, 165, 165, .7)';
}

function blink_indicator(indicator) {
    if (indicator) {
        serial_indicator.style.backgroundColor = 'rgba(78, 255, 87, 0.7)';
        setTimeout(() => {
            serial_indicator.style.backgroundColor = 'rgba(48, 190, 55, 0.7)';
        }, 200);
    } else {
        database_indicator.style.backgroundColor = 'rgba(14, 238, 240, 0.9)';
        setTimeout(() => {
            database_indicator.style.backgroundColor = 'rgba(53, 152, 233, 0.9)';
        }, 200);
    }
}

database_button.addEventListener('click', () => {
    ipcRenderer.send('database-click');
}); 

battery_button.addEventListener('click', () => {
    ipcRenderer.send('battery-click');
});

general_button.addEventListener('click', () => {
    ipcRenderer.send('general-click');
});

graph_button.addEventListener('click', () => {
    ipcRenderer.send('graph-click');
}); 

ipcRenderer.on('serial_connected', (event, state) => {
    set_serial_indicator(state);
});

ipcRenderer.on('database_connected', (event, state) => {
    set_database_indicator(state);
});

ipcRenderer.on('database insert', (event) => {
    blink_indicator(false);
    console.log('row');
});

ipcRenderer.on('serial_data', (event, data) => {
    console.log(data);
    pos = {
        lat: data.latitude,
        lng: data.longitude
    }

    if (pos.lat != 0  && pos.lng != 0) {
        if (marker == null) {
            marker = new google.maps.Marker({
                animation: google.maps.Animation.DROP,
                position: pos,
                map: map,
                title: 'VES'
            })
        } else {
            marker.setPosition(pos);
            map.setCenter(pos);
            map.setZoom(17);
        }
    }
    set_serial_indicator(true); //provicional mientras se soluciona el evento close de serialPort
    blink_indicator(true); //true for serial data in, false for database in
});