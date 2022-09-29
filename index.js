const request = require("request");
module.exports = (app_path, notification) => {
	const os = require("os");
	const fs = require("fs");
	const glob = require("glob");
	const path = require("path");
	let maps_path = os.homedir() + "\\Documents\\SkaterXL\\Maps\\";
	maps_path = maps_path.split("\\").join("/");
	
	console.log(app_path);
	
	last_maps = {};
	
	function listMaps(filter = "mtimeMs", sorting = "desc", custom_path = maps_path) {
		return new Promise((resolve, reject) => {
			glob(custom_path + "**/*", { dot: true }, async (err, files) => {
				if(!err) {
					let maps = {};
					for(file of files) {
						if(path.extname(file) == "") {
							const stat = await fs.promises.lstat(path.resolve(custom_path, file));
							let name = file.toLowerCase().split(custom_path.toLowerCase()).join("");
							if(stat.isFile()) maps[name] = { file, name, ...stat };
						}
						if(path.extname(file) == ".jpg" || path.extname(file) == ".png") {
							let name = file.toLowerCase().split(".jpg").join("").split(".png").join("");
							name = name.split(custom_path.toLowerCase()).join("");
							if(maps[name]) {
								maps[name].image = file;
							}
						}
					}
					
					last_maps = maps;
					let result = Object.entries(maps).sort((a, b) => {
						if(b[1][filter] < a[1][filter]) return sorting == "desc" ? -1 : 1
						if(b[1][filter] > a[1][filter]) return sorting == "desc" ? 1 : -1
						return 0;
					});
					resolve(Object.fromEntries(result));
				}
				else reject(err);
			});
		})
	}
	
	const ignore = ["console_selected_xbox", "console_selected_ps4", "console_selected_switch", "console_recheck_xbox", "console_recheck_ps4", "console_recheck_switch"].join(",");
	function listModioMaps(page = 0, token, filter = "date_updated", sorting = "desc", search = "") {
		if(filter == "downloads" || filter == "rating") sorting = sorting == "desc" ? "asc" : "desc";
		let sort = (sorting == "desc" ? "-" : "") + filter, offset = 20 * page, limit = 20;
		return new Promise((resolve, reject) => {
			//console.log(`https://api.mod.io/v1/games/629/mods?tags=Map&tags-not-in=${ignore}&_sort=${sort}&_offset=${offset}&_limit=${limit}&name-not-lk=*dropper*&name-lk=*${search}*`);
			request(`https://api.mod.io/v1/games/629/mods?tags=Map&tags-not-in=${ignore}&_sort=${sort}&_offset=${offset}&_limit=${limit}&name-not-lk=*dropper*&name-lk=*${search}*`, {headers: {Authorization: "Bearer " + token}, timeout: 20e3}, (err, res, body) => {
			try {
				body = JSON.parse(body);
			} catch(err) {
				console.log(err);
			}
			
			if(!err && res.statusCode == 200) {
				resolve(body);
			}
			else {
				reject({...body, response_status: res.statusCode});
			}
		});
	});
}

function getUserLikes(token) {
	return new Promise((resolve, reject) => {
		request('https://api.mod.io/v1/me/ratings', { headers: { Authorization: "Bearer " + token }, timeout: 20e3 }, (err, res, body) => {
			try {
				body = JSON.parse(body);
			} catch(err) {
				console.log(err);
			}

			if(!err && res.statusCode == 200) {
				let result = {};
				for(let i = 0; i < body.data.length; i++) {
					if(body.data[i].game_id == "629") {
						result[body.data[i].mod_id] = body.data[i].rating;
					}
				}
				resolve(result);
			}
			else {
				reject({...body, response_status: res.statusCode});
			}
		});
	});
}

function getUserSubscriptions(token) {
	return new Promise((resolve, reject) => {
		request('https://api.mod.io/v1/me/subscribed', { headers: { Authorization: "Bearer " + token }, timeout: 20e3 }, (err, res, body) => {
			try {
				body = JSON.parse(body);
			} catch(err) {
				console.log(err);
			}

			if(!err && res.statusCode == 200) {
				let result = {};
				for(let i = 0; i < body.data.length; i++) {
					if(body.data[i].game_id == "629") {
						result[body.data[i].id] = true;
					}
				}
				resolve(result);
			}
			else {
				reject({...body, response_status: res.statusCode});
			}
		});
	});
}

function rateModio(id, rating, token) {
	return new Promise((resolve, reject) => {
		request(`https://api.mod.io/v1/games/629/mods/${id}/ratings`, {
		method: "POST", headers: { Authorization: "Bearer " + token }, form: {rating}, timeout: 20e3
	}, (err, res, body) => {		
		if(!err && (res.statusCode == 201 || res.statusCode == 400)) {
			resolve(body);
		}
		else {
			reject({response_status: res.statusCode});
		}
	});});	
}

function subscribeModio(id, token, del = false) {
	return new Promise((resolve, reject) => {
		request(`https://api.mod.io/v1/games/629/mods/${id}/subscribe`, { 
		method: del ? "DELETE" : "POST", headers: {Authorization: "Bearer " + token, "Content-Type": "application/x-www-form-urlencoded"}, timeout: 20e3
	}, (err, res, body) => {
		if(!del) {
			try {
				body = JSON.parse(body);
			} catch(err) {
				console.log(err);
			}
		}
		
		if(!err && (res.statusCode == 201 || res.statusCode == 204 || res.statusCode == 400)) {
			resolve(body);
		}
		else {
			reject({...body, response_status: res.statusCode});
		}});
	});	
}

const DecompressZip = require('decompress-zip');
let download_queue = [];
let queue_running = false;

function addToDownloadQueue(id, token, custom_path = maps_path) {
	console.log(custom_path);
	request(`https://api.mod.io/v1/games/629/mods/${id}`, {headers: {Authorization: "Bearer " + token}, timeout: 20e3}, (err, res, body) => {
	try {
		body = JSON.parse(body);
	} catch(err) {
		console.log(err);
	}
	
	if(!err && res.statusCode == 200) {
		body.modfile.custom_path = custom_path;
		download_queue.push({body, ...body.modfile});
		if(!queue_running) runQueue();
	}
	else {
		reject(body);
	}
});
}

function runQueue() {
	if(download_queue[0]) {
		queue_running = true;
		let file = download_queue[0];
		let w = fs.createWriteStream(file.filename);
		let total = 0;
		let data = 0;
		
		let count = 0;
		
		request(file.download.binary_url, {timeout: 20e3}).on( 'response', function ( data ) {
			total = +data.headers['content-length'];
		}).on('data', function (chunk) {
			data += chunk.length;
			count++;
			if(count >= 24) {
				io.emit("download-percentage", { percentage: (data / total) * 100, id: file.mod_id });
				count = 0;
			}
		}).on('end', function() {
			io.emit("download-percentage", { percentage: 100, id: file.mod_id });
		}).pipe(w);
		
		w.on('finish', function(){
			if(path.extname(file.filename) == '.zip') {
				decompress(file);
			}
			
			download_queue.shift();
			runQueue();
		});
		
		w.on('error', function(err){ console.error(err)});
	}
	else {
		queue_running = false;
	}
}

function decompress(file) {
	let _path = file.filename;
	let id = file.mod_id;
	var unzipper = new DecompressZip(_path)
	
	unzipper.on('error', function (err) {
		console.log('Caught an error', err);
	});
	
	unzipper.on('extract', function (log) {
		if(log.length == 1) downloadModioImage(file, log[0].deflated);
		else {
			let image, filename;
			for(let item of log) {
				if(item.deflated) {
					if(item.deflated.toLowerCase().split(".png").length > 1 || item.deflated.toLowerCase().split(".jpg").length > 1) {
						image = item.deflated;
					}
					
					if(path.extname(item.deflated) == "") filename = item.deflated;
				}
			}
			
			let imagesplit = image.split(".");
			if(imagesplit[imagesplit.length-2] !== filename) {
				imagesplit[imagesplit.length-2] = filename;
				imagesplit = imagesplit.join(".");
				fs.rename(file.custom_path + image, file.custom_path + imagesplit, () => {
					console.log("renamed", file.custom_path + image, file.custom_path + imagesplit);
				});
			}
			
			io.emit("extracting-finished", { id });
			new notification({title: "XLhub", body: filename + " finished downloading"}).show();
		}
		deleteFile(_path);
	});
	
	unzipper.on('progress', function (fileIndex, fileCount) {
		io.emit("extracting-download", { percentage: ((fileIndex + 1) / fileCount) * 100, id });
	});
	
	unzipper.extract({path: file.custom_path, restrict: false});
}

function downloadModioImage(file, name) {
	let extension = file.body.logo.original.split(".")
	extension = extension[extension.length - 1];
	let filepath = (file.custom_path != "" ? file.custom_path : maps_path) + name + "." + extension;
	filepath = filepath.split("\\").join("/");
	let w = fs.createWriteStream(filepath);
	request(file.body.logo.original, {timeout: 20e3}).on( 'response', function ( data ) {
	}).on('data', function (chunk) {
	}).on('end', function() {
		io.emit("image-download", { id: file.mod_id });
		io.emit("extracting-finished", { id: file.mod_id });
		
		new notification({title: "XLhub", body: name + " finished downloading"}).show();
	}).pipe(w);
}

function deleteFile(path, cb) {
	fs.unlink(path, (err) => {
		if (err) {
			console.error(err)
			if(cb) {
				try {
					cb(err);
				} catch(err){}
			}
			return
		}
		if(cb) {
			try {
				cb();
			} catch(err){}
		}
	});
}

function openPath(path) {
	require('child_process').exec(`explorer.exe /select,"${path.split("/").join("\\")}"`);
}

const express = require('express');
const app = express();
const port = 420;
const bp = require('body-parser');
app.use(bp.json())

app.get('/modio/maps', (req, res) => {
	listModioMaps(req.query.page, req.query.token, req.query.filter, req.query.sorting, req.query.search).then(maps => {
		res.send(maps);
	}).catch(err => {
		res.status(500).send(err);
	})
});

app.get('/local/maps', (req, res) => {
	listMaps(req.query.filter, req.query.sorting, req.query.custom_path && req.query.custom_path.split(" ").join("") != "" ? decodeURIComponent(req.query.custom_path) : undefined).then(maps => {
		res.send(maps);
	}).catch(err => {
		res.status(500).send(err);
	})
});

app.delete('/local/map', (req, res) => {
	deleteFile(req.body.file, (err) => {
		if(!err) res.status(200).send();
		else res.status(500).send(err);
	});
});

app.get('/internal/open', (req, res) => {
	openPath(req.query.file, (err) => {
		if(!err) res.status(200).send();
		else res.status(500).send(err);
	});
});


app.post('/modio/download', (req, res) => {
	if(req.body.id) {
		console.log(req.body.custom_path, decodeURIComponent(req.body.custom_path));
		addToDownloadQueue(req.body.id, req.body.token, req.body.custom_path && req.body.custom_path.split(" ").join("") != "" ? decodeURIComponent(req.body.custom_path) : undefined);
		res.status(200).send();
	}	
	else {
		res.status(400).send();
	}
});

app.post("/modio/rating/positive", (req, res) => {
	if(!req.body.id) res.status(400).send();
	else rateModio(req.body.id, 1, req.body.token).then(data => {res.send(data)}).catch(err => {res.status(500).send(err)});
});

app.post("/modio/rating/negative", (req, res) => {
	if(!req.body.id) res.status(400).send();
	else rateModio(req.body.id, -1, req.body.token).then(data => {res.send(data)}).catch(err => {res.status(500).send(err)});
});

app.post("/modio/rating/remove", (req, res) => {
	if(!req.body.id) res.status(400).send();
	else rateModio(req.body.id, 0, req.body.token).then(data => {res.send(data)}).catch(err => {res.status(500).send(err)});
});

app.post("/modio/subscribe", (req, res) => {
	if(!req.body.id) res.status(400).send();
	else subscribeModio(req.body.id, req.body.token).then(data => {res.send(data)}).catch(err => {res.status(500).send(err)});
});

app.delete("/modio/subscribe", (req, res) => {
	if(!req.body.id) res.status(400).send();
	else subscribeModio(req.body.id, req.body.token, true).then(data => {res.send(data)}).catch(err => {res.status(500).send(err)});
});

var mime = {
	html: 'text/html',
	txt: 'text/plain',
	css: 'text/css',
	gif: 'image/gif',
	jpg: 'image/jpeg',
	png: 'image/png',
	svg: 'image/svg+xml',
	js: 'application/javascript'
};

app.get('/local/image', (req, res) => {
	if(last_maps[req.query.id]) {
		sendImg(req, res);
	}
	else {
		listMaps().then(maps => {
			sendImg(req, res);
		}).catch(err => {
			res.status(500).send(err);
		})
	}
});

app.get('/modio/ratings', (req, res) => {
	getUserLikes(req.query.token).then(result => {res.send(result);}).catch(err => {res.status(500).send(err)});
});	

app.get('/modio/subscriptions', (req, res) => {
	getUserSubscriptions(req.query.token).then(result => {res.send(result);}).catch(err => {res.status(500).send(err)});
});	


function sendImg(req, res) {
	let img = last_maps[decodeURIComponent(req.query.id)].image;
	if(img) {
		var type = mime[path.extname(img).slice(1)] || 'text/plain';
		
		var s = fs.createReadStream(img);
		s.on('open', function () {
			res.set('Content-Type', type);
			s.pipe(res);
		});
		s.on('error', function () {
			res.set('Content-Type', 'text/plain');
			res.status(404).end('Not found');
		});
	}
	else {
		res.status(404).send();
	}
}

const { dialog } = require('electron');
function askPath() {
	return new Promise((resolve, reject) => {
		dialog.showOpenDialog({properties: ['openDirectory']}).then(folder => {
			if(!folder.canceled) {
				resolve(folder.filePaths[0]);
			}
			else {
				reject();
			}
		});
	})
}

app.get('/internal/path', (req, res) => {
	askPath().then(path => res.status(200).send({path: (path + '\\').split("\\").join("/")})).catch(() => {res.status(444).send({})});
});

console.log(path.resolve(app_path, './webapp'));
app.use(express.static(path.resolve(app_path, './webapp')));

const http = require('http').Server(app);
const io = require('socket.io')(http);

io.on('connection', function(socket) {
	socket.on('disconnect', function () {
		
	});
});


http.listen(port, () => {
	console.log(`Map manager server listening on port ${port}`)
})

return app;
}