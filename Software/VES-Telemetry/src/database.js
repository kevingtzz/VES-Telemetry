const mongoose = require('mongoose');
const uri = 'mongodb://localhost/kratosdb';
const db = mongoose.connection;

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

module.exports = {
    // insert,
    // get_recording_state,
    set_databaseWindow,
    // set_mainWindow
}