const mongoose = require('mongoose');
const uri = 'mongodb://localhost/kratosdb';
const {ipcMain} = require('electron');
const db = mongoose.connection;
const Event = require('./models/Event');

let databaseWindow = null;
let mainWindow = null;
let event_selected = null;
let recording = false;

mongoose.connect(uri)
    .catch(err => {
        console.error("Error: ", err);
    });

db.once('open', _ => {
    console.info("Database is connected to: ", uri);
});

db.on('error', err => {
    console.error("Error: ", err);
});

// ==================== Functions ===================//

function set_databaseWindow(window) {
    databaseWindow = window;
}

function set_mainWindow(window) {
    mainWindow = window;
} 


async function createEvent(name) {
    let event = new Event({
        name,
        data: []
    });
    
    const eventSaved = await event.save();
    return eventSaved;
}

async function findEvents() {
    const events = await Event.find();
    return events;
}

async function findEventToDelete(event_name) {
    let response = await Event.findOneAndDelete({ name: event_name });
    return response;
}

// ====================== IPC events ======================//

ipcMain.on('get events', e => {
    findEvents()
        .then(events => {
            let data = [
                events.map(event => event.name),
                event_selected,
                recording
            ];
            e.reply('data update', data);
        })
        .catch(err => console.error(err));
});

ipcMain.on('create event', (e, name) => {
    createEvent(name)
        .then(eventSaved => {
            if (databaseWindow !== null) e.reply('event created', eventSaved.name);
            console.log("saved!");
            console.log(eventSaved.name);
        })
        .catch(err => console.error(err));
});

ipcMain.on('event selected', (e, event_name) => {
    event_selected = event_name;
    if (mainWindow !== null) mainWindow.webContents.send('database_connected', true); // Activates database indicatos on main window
    e.reply('event selected', event_name);
});

ipcMain.on('event deleted', (e, event_name) => {
    findEventToDelete(event_name)
        .then(res => {
            e.reply('event deleted', res.name);
        })
        .catch(err => console.error(err));
});

module.exports = {
    // insert,
    // get_recording_state,
    set_databaseWindow,
    set_mainWindow
}