const { app, Tray, Menu, nativeImage, BrowserWindow } = require('electron')
const app_path = app.getAppPath();
const express_app = require("./index.js")(app_path);

let tray;

const path = require('path')
let mainWindow;

function createWindow () {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 600,
        frame:false,
        show: true,
        webPreferences: {},
        icon: nativeImage.createFromPath(path.resolve(app_path, './webapp/MapHubIcon.ico'))
    });
    mainWindow.webContents.setFrameRate(60);
    mainWindow.resizable = false;
    mainWindow.loadURL('http://localhost:420')
    mainWindow.setMenuBarVisibility(false);

    // mainWindow.webContents.on('new-window', (e, url) => {
    //     e.preventDefault();
    //     require('electron').shell.openExternal(url);
    // });
}

let icon;
app.whenReady().then(() => {
    createWindow();
    icon = nativeImage.createFromPath(path.resolve(app_path, './webapp/MapHubIcon.ico'))
    tray = new Tray(icon)
    
    const menu = Menu.buildFromTemplate([
        { 
            label: 'Open',
            click() { show(); }
        },
        {
            label: 'Quit',
            click() { app.quit(); }
        }
    ]);
    
    tray.setToolTip('MAPHUB')
    tray.setContextMenu(menu)
    
    tray.on('double-click', (e) => {
        show();
    })
});

function show() {
    mainWindow.show();
    mainWindow.focus();
}

express_app.get("/internal/minimize", (req, res) => {
    mainWindow.hide();
    res.status(200).send();
});