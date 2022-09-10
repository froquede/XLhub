module.exports = (app_path) => {
	const os = require("os");
	const fs = require("fs");
	const glob = require("glob");
	const path = require("path");
	let maps_path = os.homedir() + "\\Documents\\SkaterXL\\Maps\\";
	maps_path = maps_path.split("\\").join("/");
	
	console.log(app_path);
	
	last_maps = {};
	
	function listMaps(filter = "mtimeMs") {
		return new Promise((resolve, reject) => {
			glob(maps_path + "**/*", { dot: true }, async (err, files) => {
				if(!err) {
					let maps = {};
					for(file of files) {
						if(path.extname(file) == "") {
							const stat = await fs.promises.lstat(path.resolve(maps_path, file));
							let name = file.toLowerCase().split(maps_path.toLowerCase()).join("");
							if(stat.isFile()) maps[name] = { file, ...stat };
						}
						if(path.extname(file) == ".jpg" || path.extname(file) == ".png") {
							let name = file.toLowerCase().split(".jpg").join("").split(".png").join("");
							name = name.split(maps_path.toLowerCase()).join("");
							if(maps[name]) {
								maps[name].image = file;
							}
						}
					}
					
					last_maps = maps;
					let result = Object.entries(maps).sort((a, b) => b[1][filter] - a[1][filter]);
					resolve(Object.fromEntries(result));
				}
				else reject(err);
			});
		})
	}
	
	const request = require("request");
	const token = "Bearer eyJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwiYWxnIjoiUlNBLU9BRVAiLCJjdHkiOiJKV1QiLCJ6aXAiOiJERUYiLCJ4NXQiOiJzR0pJLUJhTmhlTDctUjBMejJFdlhhNlQweGsifQ.MEkyRzv6AV7YlJ4YAPESBSR5zzbOlFX94PixboHBrfnz8WZksyD8gbiE-5O1ntPcdkmLFrd87htACW37vEynXlkA8j86-wtfDqauDQoABUs9jaOv4sAAAoUSUgfELKY9S2cmoe_1bonwe9J-Y3BNgBOovf7ISHMw94QnD5Mr8fLxPoln56ICXBjOPxj3r2nLFR5SZ5svusnz6U6M-ihCs7goNRRavyJjpIklEaanrNebJYDucJ-A1ilEr0MkDuHft02FsCJz8J8AGpOsryNDUjX7hUKFJCU_6nM4qFV6B85UoFbAFSpCrqs-fZRtRk2sfQoMccpj5Ae_siK3dOr5wA.f8nAhipu883GfVBkvDDkpA.xqxWyY2Mganvz1ihslBLKII1VupRnkhgMz1a2IRnuzVpeRuItRLvtwyyc06Kl1ws97z6_aaT4bR3kRNm3Xf3DOZIwV7rHKudrt8qbWEIxh4sdBBXYDpww58VcRYut37F06_UuURAIEIOYEx2Busfr8rWQ1oXkcN5UY9vCgptAw5U3_Ksp-scO6j5w3q9EtPfPLjUVX_YsfUXxbUJHA_Z0Qjw8Tp32D7dNFubGzUFotm20d8XbwSJlUzovUzxjeb3mRMiC9hPh0e89TksUDnkkYxpxxRj_I7iuhkuE0PKfAtvapl8zsQQcy4QBYxn-tYWldW5NX0G3LibfTBkSM3W0H-rOe6OnUyoD9wbZteQM7mbY8-14R-2NF4G2nLIw-beZ5sgcUKO0OCGCl_CvvoZjmceZXII1JBnKPv6_MClmT73teVoGWw_JddTza9E6wnuTqYeR1dEKwK5UHgqdxlceMB02IrAL95DcR_CA-EVQNkTSGDM-0oGvcHSyEFrfiR_8yDCQHNSjc63fZ6OEOANzT99CSWQHaGW-4ZyFRuOFyYpN1TkUKgLHAm5JZsKS4FvrnqgbFQXGBZU57Pa4EezYvWGhPTaf8T4r63SQWholQ8UifFFvtSHdQSTlBb5m4QHFvGW9YiydY16VZ9e0wO7ehz4IpP5Un7RwJPhL_b9NiJJm2Nu00430rItny7yM4yALJ7EbhI9TWTory6x7F4lKQcalR93sFYXQtByFNf0sA1AbrMlwdWhhHl7LfJBBd1RI6O1zmEEVQ6fvqnkxAC3VnZYpeyczub-OvjNpTQ_p1qi7AjN27pd3drR2tJWFuTJPO_KVn-JYdx3FtJ7Q8ULFJPks6yAB12fkYx3h-ZIdK5r050tCkia4QfYp3R_zWVexP-6Jqr3llI7XWytVqkAZbBAWU7Jh8FwI1J7OX525xY-hJwcZtXvvU-9bkCUV1hTJta-5dR462NrDkFN50PRQsstw9z5k9QOawMxJ2A4dgEUoB4L5s4lON3PwYNjUtLiFLf372eGQ8I3oVoyLDUpwh3OLdHnQVVYIT9BfuGt7TyDyxsteH8RfCagKf33t2Ps.ZHJZ6AvheYNqGmq0jFuk4Q";
	function listModioMaps(page = 0) {
		let sort = "-date_updated", offset = 20 * page, limit = 20;
		return new Promise((resolve, reject) => {
			request(`https://api.mod.io/v1/games/629/mods?tags=Map&_sort=${sort}&_offset=${offset}&_limit=${limit}`, {headers: {Authorization: token}}, (err, res, body) => {
			try {
				body = JSON.parse(body);
			} catch(err) {
				console.log(err);
			}
			
			if(!err && res.statusCode == 200) {
				resolve(body);
			}
			else {
				reject(body);
			}
		});
	});
}

const DecompressZip = require('decompress-zip');
let download_queue = [];
let queue_running = false;

function addToDownloadQueue(id) {
	request(`https://api.mod.io/v1/games/629/mods/${id}`, {headers: {Authorization: token}}, (err, res, body) => {
	try {
		body = JSON.parse(body);
	} catch(err) {
		console.log(err);
	}
	
	if(!err && res.statusCode == 200) {
		download_queue.push(body.modfile);
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
		var w = fs.createWriteStream(file.filename);
		let total = 0;
		let data = 0;
		
		let count = 0;
		
		request(file.download.binary_url).on( 'response', function ( data ) {
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
	let path = file.filename;
	let id = file.mod_id;
	var unzipper = new DecompressZip(path)
	
	unzipper.on('error', function (err) {
		console.log('Caught an error', err);
	});
	
	unzipper.on('extract', function (log) {
		io.emit("extracting-finished", { id });
		deleteFile(path);
	});
	
	unzipper.on('progress', function (fileIndex, fileCount) {
		io.emit("extracting-download", { percentage: ((fileIndex + 1) / fileCount) * 100, id });
	});
	
	unzipper.extract({path: maps_path, restrict: false});
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
	listModioMaps(req.query.page).then(maps => {
		res.send(maps);
	}).catch(err => {
		res.status(500).send(err);
	})
});

app.get('/local/maps', (req, res) => {
	listMaps().then(maps => {
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
		addToDownloadQueue(req.body.id);
		res.status(200).send();
	}	
	else {
		res.status(400).send();
	}
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

function sendImg(req, res) {
	let img = last_maps[req.query.id].image;
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