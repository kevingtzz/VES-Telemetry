const mongoose = require('mongoose');
const uri = 'mongodb://localhost/kratosdb';
const {ipcMain} = require('electron');
const db = mongoose.connection;
const Event = require('./models/Event');

let databaseWindow = null;

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

function set_databaseWindow(window) {
    databaseWindow = window;
}

ipcMain.on('create event', (e, name) => {
    let event = new Event({
        name,
        data: []
    });

    event.save((err, document) => {
        if (err) console.error(err);
        if (databaseWindow !== null) databaseWindow.webContents.send('row affected', document);
        e.reply('table created', name);
    });

    console.log(event);
});

module.exports = {
    // insert,
    // get_recording_state,
    set_databaseWindow,
    // set_mainWindow
}