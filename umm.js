const fs = require("fs");
const fse = require('fs-extra');
const path = require("path");

function applyUMM() {
    console.log("Starting UMM install");
    return new Promise((resolve, reject) => {
        fse.copy(path.resolve(__dirname, "resources\\UMM_" + global.config.gameVersion.split('.').join('') + "\\UnityModManager"), global.config.gamePath + "\\SkaterXL_Data\\Managed\\UnityModManager",  { overwrite: true, errorOnExist: false })
        .then(() => {
            console.log("UMM folder done");
            fse.copy(path.resolve(__dirname, "resources\\UMM_" + global.config.gameVersion.split('.').join('') + "\\Assembly-CSharp.dll"), global.config.gamePath + "\\SkaterXL_Data\\Managed\\Assembly-CSharp.dll",  { overwrite: true, errorOnExist: false })
            .then(() => {
                console.log("DLL done");
                let modsFolder = global.config.gamePath + "\\Mods";
                fs.stat(modsFolder, (err, stats) => {
                    if(err) fs.mkdir(modsFolder, () => {
                        console.log("Mods folder created");
                    });
                    resolve();
                });   
            })
            .catch(err => reject(err))
        })
        .catch(err => reject(err)) 
    })
}

module.exports = {
    applyUMM,
}