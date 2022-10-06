let found = false;
if (require('electron-squirrel-startup')) return;

require('node-netstat')({
    limit: 1,
    filter: {
        local: {
            port: 420
        }
    },
    done: function (err) {
        if(!found) init();
    }
}, function (data) {
    if(data.state == "LISTENING") {
        found = true;
        require("request")("http://localhost:420/internal/maximize");
        setTimeout(() => {
            process.exit();
        }, 1e3);
    }
});

function init() {
    const { app, Tray, Menu, nativeImage, BrowserWindow, Notification } = require('electron')
    const app_path = app.getAppPath();
    
    const express_app = require("./index.js")(app_path, Notification);
    
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
            icon: nativeImage.createFromPath(path.resolve(app_path, './webapp/XLhubIcon.ico'))
        });
        mainWindow.webContents.setFrameRate(60);
        mainWindow.resizable = false;
        mainWindow.loadURL('http://localhost:420')
        mainWindow.setMenuBarVisibility(false);
        
        if (process.platform === 'win32')
        {
            app.setAppUserModelId(app.name);
        }
        
        mainWindow.webContents.on('new-window', (e, url) => {
            e.preventDefault();
            require('electron').shell.openExternal(url);
        });
    }
    
    let icon;
    app.whenReady().then(() => {
        createWindow();
        icon = nativeImage.createFromPath(path.resolve(app_path, './webapp/XLhubIcon.ico'))
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
        
        tray.setToolTip('XLhub')
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
    
    express_app.get("/internal/maximize", (req, res) => {
        show();
        res.status(200).send();
    });
}
