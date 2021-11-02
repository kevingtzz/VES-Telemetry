const r = require('rethinkdb');
const {ipcMain} = require('electron');

let databaseWindow = null;
let mainWindow = null;
let connection = null;
let table_selected = null;
let recording = false;

r.connect({host: 'localhost', port: 28015, db: 'KRATOS-VES'}, (err, conn) => {
    if (err) throw err;
    connection = conn;
    module.exports.database_connection = connection;
    console.info('Database connected.');
});

ipcMain.on('get tables', (event) => {
    r.db('KRATOS-VES').tableList().run(connection, (err, tables) => {
        if (err) throw err;
        data = [tables, table_selected, recording];
        event.reply('data update', data);
    });
});

ipcMain.on('create table', (event, name) => {
    r.db('KRATOS-VES').tableCreate(name).run(connection, (err, result) => {
        if (err) {
            throw err;
        }
        let res = JSON.stringify(result, null, 2);
        if (databaseWindow !== null) databaseWindow.webContents.send('row affected', res);
        event.reply('table created', name);
    });
});

ipcMain.on('table selected', (event, name) => {
    table_selected = name;
    if (mainWindow !== null) mainWindow.webContents.send('database_connected', true);
    event.reply('table selected', name);
});

ipcMain.on('table deleted', (event, name) => {
    r.db('KRATOS-VES').tableDrop(name).run(connection, (err, result) => {
        if (err) {
            throw err;
        }
        event.reply('table deleted', name);
        let res = JSON.stringify(result, null, 2);
        if (databaseWindow !== null) databaseWindow.webContents.send('row affected', res);
    });
});

ipcMain.on('record', (event, state) => {
    recording = state;
});

ipcMain.on('get data', (event) => {
    if (table_selected !== null) {
        r.db('KRATOS-VES').table(table_selected).orderBy('timestamp').run(connection, (err, cursor) => {
            if (err) throw err;
            event.reply('data', cursor);
        });
    }
});

function insert(data) {
    r.table(table_selected).insert(data).run(connection, (err, result) => {
        if (err) throw err;
        let res = JSON.stringify(result, null, 2);
        if (databaseWindow !== null) databaseWindow.webContents.send('row affected', res);
        if (mainWindow !== null) mainWindow.webContents.send('database insert');
    });
}

function get_recording_state() {
    return recording;
}

function set_databaseWindow(window) {
    databaseWindow = window;
}

function set_mainWindow(window) {
    mainWindow = window;
} 

module.exports = {
    insert,
    get_recording_state,
    set_databaseWindow,
    set_mainWindow
}
