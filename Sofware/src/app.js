const {app, BrowserWindow, Menu, MenuItem, ipcMain} = require('electron');
const serial = require('./serial.js');
const database = require('./database.js');
const path = require('path');

if (process.env.NODE_ENV !== 'production') require('electron-reload')(__dirname, {
    //electron: path.join(__dirname, '../node_modules', '.bin', 'electron')
});

let mainWindow = null; 
let batteryWindow = null;
let databaseWindow = null;

app.on('ready', () => {
    create_main_window();
    serial.set_mainWindow(mainWindow);
    database.set_mainWindow(mainWindow);
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open
    if (mainWindow === null) {
      create_main_window();
    }
});

app.on('window-all-closed', () => {
// On macOS it is common for applications and their menu bar
// to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit()
    }
});

//=============================== Windows =================================//

function create_main_window() {
    
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 700,
        webPreferences: {
            nodeIntegration: true
        },
        minWidth: 800,
        minHeight: 650,
        title: "VES Telemetry"
    });

    const template = [
        // { role: 'appMenu' }
        ...(process.platform === 'darwin' ? [{
            label: app.name,
            submenu: [{
                    role: 'hide'
                },
                {
                    role: 'hideothers'
                },
                {
                    role: 'unhide'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'quit'
                }
            ]
        }] : []),
        // { role: 'viewMenu' }
        {
            label: 'View',
            submenu: [{
                    role: 'reload'
                },
                {
                    role: 'forcereload'
                },
                {
                    role: 'toggledevtools'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'resetzoom'
                },
                {
                    role: 'zoomin'
                },
                {
                    role: 'zoomout'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'togglefullscreen'
                }
            ]
        },
        // { role: 'windowMenu' }
        {
            label: 'Window',
            submenu: [{
                    role: 'minimize'
                },
                {
                    role: 'zoom'
                },
                ...(process.platform === 'darwin' ? [{
                        type: 'separator'
                    },
                    {
                        role: 'front'
                    },
                    {
                        type: 'separator'
                    },
                    {
                        role: 'window'
                    }
                ] : [{
                    role: 'close'
                }])
            ]
        },
        {
            label: 'Tools',
            submenu: [{
                label: 'Console',
                click: () => {
                    mainWindow.webContents.openDevTools();
                }
            }]
        },
        {
            role: 'help',
            submenu: [{
                label: 'Learn More',
                click: async () => {
                    const {
                        shell
                    } = require('electron')
                    await shell.openExternal('https://electronjs.org')
                }
            }]
        }
    ]

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, 'views/main.html'));

    //mainWindow.webContents.openDevTools();

    // Emitido cuando la ventana es cerrada.
    mainWindow.on('closed', () => {
        // Elimina la referencia al objeto window, normalmente  guardarías las ventanas
        // en un vector si tu aplicación soporta múltiples ventanas, este es el momento
        // en el que deberías borrar el elemento correspondiente.
        mainWindow = null;
        serial.set_mainWindow(mainWindow);
    });

}

function create_database_window() {
    databaseWindow = new BrowserWindow({
        width: 600,
        height: 380,
        title: 'Database',
        webPreferences: {
            nodeIntegration: true
        },
        resizable: false
    });

    database.set_databaseWindow(databaseWindow);
    databaseWindow.loadFile(path.join(__dirname, 'views/database.html'));

    databaseWindow.on('closed', () => {
        databaseWindow = null;
    })
}

function create_battery_window() {
    batteryWindow = new BrowserWindow({
        width: 600,
        height: 330,
        title: 'Batteries',
        webPreferences: {
          nodeIntegration: true
      }
    });

    serial.set_batteryWindow(batteryWindow);
    batteryWindow.loadFile(path.join(__dirname, 'views/battery.html'));

    batteryWindow.on('closed', () => {
        batteryWindow = null;
        serial.set_batteryWindow(batteryWindow);
    })
}

//=================================== Events =====================================//

ipcMain.on('database-click', (event) => {
    if (databaseWindow === null) {
        create_database_window();
    }
    //databaseWindow.webContents.openDevTools();
});

ipcMain.on('battery-click', (event) => {
    if (batteryWindow === null) {
        create_battery_window();
    }
    //batteryWindow.webContents.openDevTools();
});

ipcMain.on('graph-click', (event) => {

    let graphWin = new BrowserWindow({
        width: 620,
        height: 360,
        title: 'Graphic',
        minWidth: 600,
        minHeight: 330,
        webPreferences: {
          nodeIntegration: true
      }
    });

    graphWin.loadFile(path.join(__dirname, 'views/graph.html'));

    serial.add_graphWindow(graphWin);

    graphWin.on('closed', () => {
        graphWin = null;
    });
});