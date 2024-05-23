const request = require("request");
const os = require("os");
const fs = require("fs-extra");
const glob = require("glob");
const path = require("path");

const mods = require('./mods.json');
global.mods = mods;
const sounds = require('./sounds.json');
global.sounds = sounds;

function getModsIds() {
	let ids = [];
	for(let i = 0; i < global.mods.length; i++) {
		ids.push(global.mods[i].id);
	}

	return ids.join(',');
}

function getSoundsIds() {
	let ids = [];
	for(let i = 0; i < global.sounds.length; i++) {
		ids.push(global.sounds[i].id);
	}

	return ids.join(',');
}

module.exports = (app_path, notification) => {
	let maps_path = os.homedir() + "\\Documents\\SkaterXL\\Maps\\";
	maps_path = maps_path.split("\\\\").join("\\").split("\\").join("/");

	if (!global.config.maps_path) global.set("maps_path", maps_path);
	
	last_maps = {};
	last_mods = {};
	last_sounds = {};

	deleteFile(path.resolve(__dirname, "tmp"), () => {
		fs.mkdir(path.resolve(__dirname, "tmp"), (err => {
			console.log(err);
		}));
	});

	function updateModsGithub() {
		request("https://raw.githubusercontent.com/roquef/XLhub/main/mods.json", (err, res, body) => {
			if(res.statusCode == 200) {
				try {
					body = JSON.parse(body);
					
					fs.writeFile(path.resolve(app_path, 'mods_backup.json'), JSON.stringify(global.mods, null, 4), err => {
						if(!err) {
							global.mods = body;
							fs.writeFile(path.resolve(app_path, 'mods.json'), JSON.stringify(global.mods, null, 4), err => {
								console.log(!err ? "Mod list updated" : err);

								io.emit("mod-list-updated", global.mods);
							})
						}
						else console.log(err);
					});
				} catch(err) {
					console.log(err);
				}
			}
		});

		request("https://raw.githubusercontent.com/roquef/XLhub/main/sounds.json", (err, res, body) => {
			if(res.statusCode == 200) {
				try {
					body = JSON.parse(body);
					
					fs.writeFile(path.resolve(app_path, 'sounds_backup.json'), JSON.stringify(global.sounds, null, 4), err => {
						if(!err) {
							global.sounds = body;
							fs.writeFile(path.resolve(app_path, 'sounds.json'), JSON.stringify(global.sounds, null, 4), err => {
								console.log(!err ? "Sound list updated" : err);

								io.emit("mod-list-updated", global.sounds);
							})
						}
						else console.log(err);
					});
				} catch(err) {
					console.log(err);
				}
			}
		});
	}

	updateModsGithub();
	global.updateModsGithub = updateModsGithub;

	function listMaps(filter = "mtimeMs", sorting = "desc") {
		return new Promise((resolve, reject) => {
			glob(global.config.maps_path + "**/*", { dot: true }, async (err, files) => {
				if(!err) {
					let maps = {};
					for(file of files) {
						if(path.extname(file) == "") {
							const stat = await fs.promises.lstat(path.resolve(global.config.maps_path, file));
							let name = file.toLowerCase().split(global.config.maps_path.toLowerCase()).join("");
							if(stat.isFile()) maps[name] = { file, name, ...stat };
						}
						if(path.extname(file) == ".jpg" || path.extname(file) == ".png") {
							let name = file.toLowerCase().split(".jpg").join("").split(".png").join("");
							name = name.split(global.config.maps_path.toLowerCase()).join("");
							if(maps[name]) {
								maps[name].image = file;
							}
						}
					}
					
					last_maps = maps;
					let result = Object.entries(maps).sort((a, b) => {
						if (typeof(a[1][filter]) == 'string' && typeof(b[1][filter]) == 'string') return sorting == "desc" ? - a[1][filter].localeCompare(b[1][filter]) :  a[1][filter].localeCompare(b[1][filter]);
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

	function listMods(filter = "name", sorting = "asc") {
		return new Promise((resolve, reject) => {
			let _path = global.config.gamePath + "\\Mods";

			fs.stat(_path, err => {
				if(!err) {
					glob(_path + "\\**\\*", { dot: true }, async (err, files) => {
						if(!err) {
							let mods = {};
							for(file of files) {
								if(file.toLowerCase().split('info.json').length > 1) {
									try {
										let info = require(file);
										let folder = file.split('/Info.json')[0];
										let stat = await fs.promises.lstat(folder);

										mods[info.Id] = {
											name: info.Id,
											version: info.Version,
											file: folder,
											...stat,
											...info
										}
									}
									catch(err) {}
								}
							}

							last_mods = mods;
							let result = Object.entries(mods).sort((a, b) => {
								if (typeof(a[1][filter]) == 'string' && typeof(b[1][filter]) == 'string') return sorting == "desc" ? - a[1][filter].localeCompare(b[1][filter]) :  a[1][filter].localeCompare(b[1][filter]);
								if(b[1][filter] < a[1][filter]) return sorting == "desc" ? -1 : 1
								if(b[1][filter] > a[1][filter]) return sorting == "desc" ? 1 : -1
								return 0;
							});
							resolve(Object.fromEntries(result));
						}
					});
				}
				else reject();
			});			
		})
	}

	function listSounds(filter = "name", sorting = "asc") {
		return new Promise((resolve, reject) => {
			let _path = global.config.gamePath + "\\Mods\\SoundMod\\Sounds";

			fs.stat(_path, err => {
				if(!err) {
					glob(_path + "\\**\\*", { dot: true }, async (err, files) => {
						if(!err) {
							let sounds = {};
							for(file of files) {
								try {
									let stat = await fs.promises.lstat(file);
									let name = file.split('/').join('\\').split(_path + '\\').join('');

									sounds[name] = {
										name,
										file,
										...stat
									}
								}
								catch(err) {}
							}
							
							last_sounds = sounds;
							let result = Object.entries(sounds).sort((a, b) => {
								if (typeof(a[1][filter]) == 'string' && typeof(b[1][filter]) == 'string') return sorting == "desc" ? - a[1][filter].localeCompare(b[1][filter]) :  a[1][filter].localeCompare(b[1][filter]);
								if(b[1][filter] < a[1][filter]) return sorting == "desc" ? -1 : 1
								if(b[1][filter] > a[1][filter]) return sorting == "desc" ? 1 : -1
								return 0;
							});
							resolve(Object.fromEntries(result));
						}
					});
				}
				else reject();
			});			
		})
	}
	
	const ignore = ["console_selected_xbox", "console_selected_ps4", "console_selected_switch", "console_recheck_xbox", "console_recheck_ps4", "console_recheck_switch"].join(",");
	function listModioMaps(page = 0, token, filter = "date_updated", sorting = "desc", search = "") {
		if(filter == "downloads" || filter == "rating") sorting = sorting == "desc" ? "asc" : "desc";
		let sort = (sorting == "desc" ? "-" : "") + filter, offset = 20 * page, limit = 20;
		return new Promise((resolve, reject) => {
			request(`https://u-4054039.modapi.io/v1/games/629/mods?tags=Map&tags-not-in=${ignore}&_sort=${sort}&_offset=${offset}&_limit=${limit}&name-not-lk=*dropper*&name-not-lk=*editor*&name-lk=*${search}*`, {headers: {Authorization: "Bearer " + token}, timeout: 20e3}, (err, res, body) => {
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

	function listModioScripts(page = 0, token, filter = "date_updated", sorting = "desc", search = "") {
		if(filter == "downloads" || filter == "rating") sorting = sorting == "desc" ? "asc" : "desc";
		let sort = (sorting == "desc" ? "-" : "") + filter, offset = 20 * page, limit = 20;
		return new Promise((resolve, reject) => {
			console.log(`https://u-4054039.modapi.io/v1/games/629/mods?_sort=${sort}&_offset=${offset}&_limit=${limit}&id-in=${getModsIds()}&name-lk=*${search}*`);
			request(`https://u-4054039.modapi.io/v1/games/629/mods?_sort=${sort}&_offset=${offset}&_limit=${limit}&id-in=${getModsIds()}&name-lk=*${search}*`, {headers: {Authorization: "Bearer " + token}, timeout: 20e3}, (err, res, body) => {
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

	function listModioSounds(page = 0, token, filter = "date_updated", sorting = "desc", search = "") {
		if(filter == "downloads" || filter == "rating") sorting = sorting == "desc" ? "asc" : "desc";
		let sort = (sorting == "desc" ? "-" : "") + filter, offset = 20 * page, limit = 20;
		return new Promise((resolve, reject) => {
			console.log(`https://u-4054039.modapi.io/v1/games/629/mods?_sort=${sort}&_offset=${offset}&_limit=${limit}&id-in=${getSoundsIds()}&name-lk=*${search}*`);
			request(`https://u-4054039.modapi.io/v1/games/629/mods?_sort=${sort}&_offset=${offset}&_limit=${limit}&id-in=${getSoundsIds()}&name-lk=*${search}*`, {headers: {Authorization: "Bearer " + token}, timeout: 20e3}, (err, res, body) => {
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
			request('https://u-4054039.modapi.io/v1/me/ratings', { headers: { Authorization: "Bearer " + token }, timeout: 20e3 }, (err, res, body) => {
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
			request('https://u-4054039.modapi.io/v1/me/subscribed', { headers: { Authorization: "Bearer " + token }, timeout: 20e3 }, (err, res, body) => {
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

	function getModFiles(id, token) {
		return new Promise((resolve, reject) => {
			request(`https://u-4054039.modapi.io/v1/games/629/mods/${id}/files`, {
				method: "GET", headers: { Authorization: "Bearer " + token }, timeout: 20e3
			}, (err, res, body) => {		
				if(!err) {
					resolve(body);
				}
				else {
					reject({ response_status: res.statusCode });
				}
			});
		});	
	}

	function rateModio(id, rating, token) {
		return new Promise((resolve, reject) => {
			request(`https://u-4054039.modapi.io/v1/games/629/mods/${id}/ratings`, {
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
			request(`https://u-4054039.modapi.io/v1/games/629/mods/${id}/subscribe`, { 
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

	function addToDownloadQueue(id, token, type = "map", file_id) {
		console.log(`https://u-4054039.modapi.io/v1/games/629/mods/${id}` + (file_id ? ("/files/" + file_id) : ''));
		request(`https://u-4054039.modapi.io/v1/games/629/mods/${id}` + (file_id ? ("/files/" + file_id) : ''), {headers: {Authorization: "Bearer " + token}, timeout: 20e3}, (err, res, body) => {
			try {
				body = JSON.parse(body);
			} catch(err) {
				console.log(err);
			}
			
			if(!err && res.statusCode == 200) {
				let file = file_id ? body : body.modfile;
				download_queue.push({body, ...file, type});
				if(!queue_running) runQueue();
			}
			else {
				console.log(id, type, body);
			}
		});
	}

	function runQueue() {
		if(download_queue[0]) {
			queue_running = true;
			let file = download_queue[0];
			let w = fs.createWriteStream(path.resolve(__dirname, "tmp") + "\\" + file.filename);
			let total = 0;
			let data = 0;
			
			let count = 0;
			
			request(file.download.binary_url, {timeout: 60e3}).on( 'response', (data) => {
				total = +data.headers['content-length'];
			}).on('data', (chunk) => {
				data += chunk.length;
				count++;
				if(count >= 24) {
					io.emit("download-percentage", { percentage: (data / total) * 100, id: file.mod_id });
					count = 0;
				}
			}).on('end', () => {
				io.emit("download-percentage", { percentage: 100, id: file.mod_id });
			}).pipe(w);
			
			w.on('finish', () => {
				if (path.extname(file.filename) == '.zip') {
					decompress(file);
				}
				
				download_queue.shift();
				runQueue();
			});
			
			w.on('error', (err) => { console.error(err)});
		}
		else {
			queue_running = false;
		}
	}

	function decompress(file, absolute = false) {
		let _path = file.filename;
		let id = file.mod_id;
		let type = file.type;
		let unzipper = new DecompressZip(!absolute ? path.resolve(__dirname, "tmp") + "\\" + _path : _path);
		console.log(_path, type, path.resolve(__dirname, "tmp") + "\\" + _path);
		
		unzipper.on('error', (err) => {
			console.log('Caught an error', err);
			io.emit("extracting-error", { error: err, id });
			new notification({title: "XLhub extraction error", body: err.toString() + " for " + _path }).show();
		});

		unzipper.on('progress', (fileIndex, fileCount) => {
			io.emit("extracting-download", { percentage: ((fileIndex + 1) / fileCount) * 100, id });
		});
		
		unzipper.on('extract', (log) => {
			let already_deleted = false;

			if(!type) {
				console.log(log);

				for(let i = 0; i < log.length; i++) {
					let file = log[i].deflated || log[i].folder || "";
					if(file.toLocaleLowerCase().split(".dll").length > 1) type = "scripts";
					if(file.toLocaleLowerCase().split(".wav").length > 1) type = "sounds";
				}

				if(!type) type = "map";

				file.type = type;

				return decompress(file, true);
			}

			if(type == "sounds") {
				let folder = getFileListLocation(log); 
				already_deleted = true;

				console.log(folder);
				if (folder != "Root Folder") {
					copyFolderRecursiveSync(path.resolve(__dirname, "tmp") + "\\" + folder, global.config.gamePath + "\\Mods\\SoundMod\\Sounds");
				}

				setTimeout(() => {
					if(!absolute) {
						deleteFile(path.resolve(__dirname, "tmp"), () => {
							 fs.mkdir(path.resolve(__dirname, "tmp"), (err => {
								 console.log(err);
							 }));
						});
					}
					
					io.emit("extracting-finished", { id, type });
					new notification({title: "XLhub", body: file.filename + " finished downloading"}).show();
				}, 250);
			}

			if(type == "scripts") {
				//console.log(log);
				io.emit("extracting-finished", { id, type });
				new notification({title: "XLhub", body: file.filename + " finished downloading"}).show();
			}

			if(type == "map") {
				if(log.length == 1) downloadModioImage(file, log[0].deflated);
				else {
					let image, filename = file.filename;

					try {
						for(let item of log) {
							if(item.deflated) {
								if(item.deflated.toLowerCase().split(".png").length > 1 || item.deflated.toLowerCase().split(".jpg").length > 1) {
									image = item.deflated;
								}
								
								if(path.extname(item.deflated) == "") filename = item.deflated;
							}
						}
						
						let imagesplit = ("" + image).split(".");
						if(imagesplit[imagesplit.length-2].toLocaleLowerCase() != filename.toLowerCase()) {
							imagesplit[imagesplit.length-2] = filename;
							imagesplit = imagesplit.join(".");
							fs.rename(global.config.maps_path + image, global.config.maps_path + imagesplit, (err) => {
								console.log(err);
								console.log("renamed", global.config.maps_path + image, global.config.maps_path + imagesplit);
							});
						}
					} catch(err) {
						console.log(err);
					}

					io.emit("extracting-finished", { id, type });
					new notification({title: "XLhub", body: filename + " finished downloading"}).show();
				}
			}

			if (!already_deleted && !absolute) {
				setTimeout(() => {
					deleteFile(path.resolve(__dirname, "tmp") + "\\" + _path);
				}, 100);
			}
		});
		
		let p = path.resolve(__dirname, 'tmp');
		if (type == "scripts") p = global.config.gamePath + "\\Mods";
		if (type == "map") p = global.config.maps_path;

		setTimeout(() => {
			unzipper.extract({ path: p, restrict: false });
		}, 0);
	}

	function copyFolderRecursiveSync(source, target) {
		if (!fs.existsSync(target)) {
			fs.mkdirSync(target);
		}
	
		const files = fs.readdirSync(source);
	
		files.forEach(function(file) {
			const currentSource = path.join(source, file);
			const currentTarget = path.join(target, file);

			if (fs.lstatSync(currentSource).isDirectory()) {
				copyFolderRecursiveSync(currentSource, currentTarget);
			} else {
				try {
					fs.copyFileSync(currentSource, currentTarget);
				} catch(err) {
					console.log(err);
				}
			}
		});
	}

	function getFileListLocation(fileList) {
		const folderNames = fileList.map(file => (file.deflated || file.folder || "").split('\\')[0]);
		return folderNames[0];
	}

	function checkZip(file) {
		decompress(file, true);
	}

	function downloadModioImage(file, name) {
		try {
			let extension = file.body.logo.original.split(".")
			extension = extension[extension.length - 1];
			let filepath = global.config.maps_path + name + "." + extension;
			filepath = filepath.split("\\").join("/");
			let w = fs.createWriteStream(filepath);
			request(file.body.logo.original, {timeout: 20e3}).on( 'response', function ( data ) {
			}).on('data', function (chunk) {
			}).on('end', function() {
				io.emit("image-download", { id: file.mod_id });	
				new notification({title: "XLhub", body: name + " finished downloading"}).show();
			}).pipe(w);
		} catch(err) {
			console.log(err);
		}

		io.emit("extracting-finished", { id: file.mod_id, type });
	}

	function deleteFile(_path, cb) {
		fs.stat(_path, (err, stats) => {
			if (err) {
				console.error(err);
				return cb();
			}

			let callback = (err) => {
				if (err) {
					console.error(err, stats.isDirectory(), _path)
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
			};

			if (stats.isDirectory()) {
				fs.rm(_path, { recursive: true, force: true, maxRetries: 1 }, callback)
			}
			else {
				fs.unlink(_path, callback);
			}
		});
	}

	function openPath(_path) {
		require('child_process').exec(`explorer.exe /select,"${_path.split("/").join("\\")}"`);
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
		listMaps(req.query.filter, req.query.sorting).then(maps => {
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

	app.get('/modio/mods', (req, res) => {
		listModioScripts(req.query.page, req.query.token, req.query.filter, req.query.sorting, req.query.search).then(mods => {
			res.send(mods);
		}).catch(err => {
			res.status(500).send(err);
		})
	});

	app.get('/local/mods', (req, res) => {
		listMods(req.query.filter, req.query.sorting).then(maps => {
			res.send(maps);
		}).catch(err => {
			res.status(500).send(err);
		})
	});

	app.get('/modio/sounds', (req, res) => {
		listModioSounds(req.query.page, req.query.token, req.query.filter, req.query.sorting, req.query.search).then(sounds => {
			res.send(sounds);
		}).catch(err => {
			res.status(500).send(err);
		})
	});

	app.get('/local/sounds', (req, res) => {
		listSounds(req.query.filter, req.query.sorting).then(maps => {
			res.send(maps);
		}).catch(err => {
			res.status(500).send(err);
		})
	});

	app.get('/internal/open', (req, res) => {
		openPath(req.query.file, (err) => {
			if(!err) res.status(200).send();
			else res.status(500).send(err);
		});
	});

	app.get('/internal/config', (req, res) => {
		res.status(200).send({ ...global.config, mods });
	});

	app.post('/modio/download', (req, res) => {
		if(req.body.id) {
			console.log(req.body.id, req.query.type, req.body.file);
			addToDownloadQueue(req.body.id, req.body.token, req.query.type, req.body.file);
			res.status(200).send();
		}	
		else {
			res.status(400).send();
		}
	});

	app.get("/modio/files", (req, res) => {
		if(!req.query.id) res.status(400).send();
		else getModFiles(req.query.id, req.query.token).then(data => {res.send(data)}).catch(err => {res.status(500).send(err)});
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

	app.post("/install/zip", (req, res) => {
		if(!req.body.file) res.status(400).send();
		else checkZip(req.body.file);
	})

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
	function askPath(openAt) {
		return new Promise((resolve, reject) => {
			let props = { properties: ['openDirectory'] };
			if(openAt) props.defaultPath = openAt;
			dialog.showOpenDialog(props).then(folder => {
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
		askPath(global.config.maps_path).then(path => {
			let p = (path + '\\').split('\\\\').join('\\').split("\\").join("/");
			global.set("maps_path", p)
			res.status(200).send({ path: p });
		}).catch(() => {res.status(444).send({})});
	});

	app.get('/internal/gamePath', (req, res) => {
		askPath(global.config.gamePath).then(path => {
			let p = path + '\\';
			p = p.split('\\\\').join('\\');
			global.delete("gameVersion");
			global.set("gamePath", p)
			global.getGameInfo();
			res.status(200).send({ path: p });
		}).catch(() => {res.status(444).send({})});
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
		console.log(`XLhub server listening on port ${port}`)
	})

	return app;
}