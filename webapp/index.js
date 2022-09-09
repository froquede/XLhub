import { html, render } from 'https://cdn.skypack.dev/lit-html';
import './map-card.js';

const socket = io();

socket.on("download-percentage", message => { window.on("download-percentage", message); })
socket.on("extracting-download", message => { window.on("extracting-download", message); })
socket.on("extracting-finished", message => { window.on("extracting-finished", message); })

function getModio(page = 0) {
    window.fetch("/modio/maps").then(res => res.json()).then(data => {
        let result = [];
        for(let map of data.data) {
            result.push(html`<map-card data='${JSON.stringify(map)}'></map-card>`);
        }

        render(result, document.querySelector(".mod-io-container"));
    });
}

function getLocal(page = 0) {
    window.fetch("/local/maps").then(res => res.json()).then(data => {
        let result = [];
        for(let key in data) {
            let map = data[key];
            map.name = key;
            result.push(html`<map-card type="local" data='${JSON.stringify(map)}'></map-card>`);
        }

        render(result, document.querySelector(".local-container"));
    });
}

getModio(0);
getLocal(0);