const fs = require("fs"), path = require("path");
let p = path.resolve(__dirname, 'config.json')
global.config = {};

fs.stat(p, (err, stats) => {
    if(!err) {
        global.config = require('./config.json');
        delete global.config.gameVersion;
    }
})

global.set = function(key, value) {
    global.config[key] = value;
    save();
}

function save() {
    fs.writeFile(p, JSON.stringify(global.config, null, 4), err => {if(err) console.log(err);})
}