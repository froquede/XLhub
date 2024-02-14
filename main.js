let found = false;
if (require('electron-squirrel-startup')) return;

require("./config.js");
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
        }, 200);
    }
});

const steamPath = require("steam-path");
let searching = false;
function findGameSteam(menu) {
	if (global.config.gamePath) {
        console.log(global.config.gamePath);
		return getGameVersion(menu);
	}

	searching = true;
	steamPath.getAppPath(962730).then(result => {
		global.set('gamePath', result.path);
		
		getGameVersion(menu);
		searching = false;
	}).catch(err => {
		console.log(err, "Game not found via steam");
		searching = false;
        getGameVersion(menu);
                
        menu.getMenuItemById('actions').enabled = false;
        menu.getMenuItemById('folders').enabled = false;
	});
}

let last_menu;
function getGameVersion(menu) {
    let command = `wmic datafile where name='${global.config.gamePath.split('\\').join('\\\\')}\\\\SkaterXL.exe' get Version`;
    command = command.split('\\\\\\\\').join('\\\\');

    if(!menu) menu = last_menu;

	require('child_process').exec(command, (err, stdout) => {
		if(!err) {
            console.log(stdout, stdout.split(" ").join("").length);

            menu.getMenuItemById('umm').enabled = true;
			if(stdout.split('2019.4.40.50731').length > 1) return global.set('gameVersion', '1.2.7.8');
			if(stdout.split('2019.3.15.65342').length > 1) return global.set('gameVersion', '1.2.2.8');

			global.set('gameVersion', 'unknown');
            menu.getMenuItemById('umm').enabled = false;
		}
		else {
            console.log(err);
            setTimeout(() => { getGameVersion(menu); }, 5e3);
        }
	})

    last_menu = menu;
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
        else {
            if (err.code == "ENOENT") {
                fs.mkdir(global.config.gamePath + '\\Mods', err => {
                    getMods(menu);
                });
            }
            else console.log(err);
        }
    });
}

function init() {
    const app_path = app.getAppPath();
    
    const express_app = require("./index.js")(app_path, Notification);
    const umm = require('./umm.js');
    
    let tray;
    
    const path = require('path')
    let mainWindow;

    global.getGameInfo = getGameInfo;
    
    function createWindow () {
        mainWindow = new BrowserWindow({
            width: 900,
            height: 642,
            frame: false,
            show: true,
            webPreferences: {},
            icon: nativeImage.createFromPath(path.resolve(app_path, './webapp/XLhubIcon.ico'))
        });
        mainWindow.webContents.setFrameRate(60);
        //mainWindow.resizable = false;
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
                id: 'actions',
                label: 'Actions',
                submenu: [
                    {
                        id: 'umm',
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
                        },
                        enabled: false
                    }
                ]
            },
            { 
                id: 'folders',
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

        getGameInfo(menu);
        
        tray.on('double-click', (e) => {
            show();
        })
    });

    function getGameInfo(menu) {
        findGameSteam(menu);
        getMods(menu);
    }
    
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