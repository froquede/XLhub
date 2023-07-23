let found = false;
if (require('electron-squirrel-startup')) return;

require("./logger.js");
const { app, Tray, Menu, nativeImage, BrowserWindow, Notification } = require('electron')
const fs = require('fs');
const os = require('os');

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

require("./config.js");

const steamPath = require("steam-path");
let searching = false;
function findGameSteam() {
	if (global.config.gamePath) {
		getGameVersion();
	}

	searching = true;
	steamPath.getAppPath(962730).then(result => {
		global.set('gamePath', result.path);
		
		getGameVersion();
		searching = false;
	}).catch(err => {
		console.log(err, "Game not found via steam");
		searching = false;
	});
}

function getGameVersion() {
	require('child_process').exec(`wmic datafile where name='${global.config.gamePath.split('\\').join('\\\\')}\\\\SkaterXL.exe' get Version`, (err, stdout) => {
		if(!err) {
			if(stdout.split('2019.4.40').length > 1) return global.set('gameVersion', '1.2.6.0');
			if(stdout.split('2019.3.15').length > 1) return global.set('gameVersion', '1.2.2.8');
			global.set('gameVersion', 'unknown');
		}
		else console.log(err);
	})
}

function getMods(menu) {
    fs.stat(global.config.gamePath + '\\Mods', (err, stats) => {
        if(!err) {
            fs.readdir(global.config.gamePath + '\\Mods', { withFileTypes: true }, (err, files) => {
                let folders = files.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name)
                let keys = {}

                for(let i = 0; i < folders.length;i++) {
                    if(folders[i].toLowerCase().split('xlgearmodifier').length > 1) keys['xlgm'] = true;
                    else keys[folders[i]] = true;
                }
                
                console.log(keys);
                
                if(!keys['SoundMod']) menu.getMenuItemById('SoundMod').enabled = false;
                if(!keys['walking-mod']) menu.getMenuItemById('walking-mod').enabled = false;
                if(!keys['xlgm']) menu.getMenuItemById('xlgm').enabled = false;
            });
        }
    });
}
 
findGameSteam();

function init() {
    const app_path = app.getAppPath();
    
    const express_app = require("./index.js")(app_path, Notification);
    const umm = require('./umm.js');
    
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
                label: 'Open XLHub',
                click() { show(); }
            },
            { 
                label: 'Actions',
                submenu: [
                    {
                        label: 'Install UnityModManager',
                        click() { 
                            show();
                            mainWindow.webContents.executeJavaScript('UMMInstall()');
                            umm.applyUMM().then(() => {
                                mainWindow.webContents.executeJavaScript('UMMInstallFinish()');
                            }).catch((err) => {
                                console.log(err);
                                mainWindow.webContents.executeJavaScript('UMMInstallError()');
                            });
                        }
                    }
                ]
            },
            { 
                label: 'Folders',
                submenu: [
                    {
                        label: 'Game path',
                        click() {
                            openPath(global.config.gamePath);
                        }
                    },
                    {
                        label: 'Gear textures',
                        click() {
                            openPath(os.homedir() + "\\Documents\\SkaterXL\\Gear")
                        }
                    },
                    {
                        label: 'Mods',
                        click() {
                            openPath(global.config.gamePath + '\\Mods');
                        }
                    },
                    {
                        id: 'SoundMod',
                        label: 'Soundmod sounds',
                        click() {
                            openPath(global.config.gamePath + '\\Mods\\SoundMod\\Sounds');
                        }
                    },
                    {
                        id: 'walking-mod',
                        label: 'Walking mod animations',
                        click() {
                            openPath(os.homedir() + "\\Documents\\SkaterXL\\walking-mod\\animations")
                        }
                    },
                    {
                        id: 'xlgm',
                        label: 'XLGM gear',
                        click() {
                            openPath(os.homedir() + "\\Documents\\SkaterXL\\XLGearModifier\\Asset Packs")
                        }
                    }
                ]
            },
            {
                label: 'Quit',
                click() { app.quit(); }
            }
        ]);
        
        tray.setToolTip('XLhub')
        tray.setContextMenu(menu)

        getMods(menu);
        
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

function openPath(path) {
    fs.stat(path, err => {
        if(!err) {
            require('child_process').exec(`explorer.exe "${path.split("/").join("\\")}"`);
        }
    })
}