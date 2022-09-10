import { html, render } from 'https://cdn.skypack.dev/lit-html';
import './loader-animation.js';
import './map-card.js';

const socket = io();

socket.on("download-percentage", message => { window.on("download-percentage", message); })
socket.on("extracting-download", message => { window.on("extracting-download", message); })
socket.on("extracting-finished", message => { 
    window.on("extracting-finished", message);
    getLocal();
});

let modio_data = []
function getModio(page = 0) {
    document.querySelector(".mod-io-container").classList.add("loading");
    modio_data.push(html`<loader-animation></loader-animation>`);
    render(modio_data, document.querySelector(".mod-io-container"));
    window.fetch("/modio/maps?page=" + page).then(res => res.json()).then(data => {
        for(let map of data.data) {
            modio_data.push(html`<map-card data='${JSON.stringify(map)}'></map-card>`);
        }
        
        document.querySelector(".mod-io-container").classList.remove("loading");
        render(modio_data, document.querySelector(".mod-io-container"));
        loading = false;
    });
}

function getLocal() {
    document.querySelector(".local-container").classList.add("loading");
    window.fetch("/local/maps").then(res => res.json()).then(data => {
        let result = [];
        for(let key in data) {
            let map = data[key];
            map.name = key;
            result.push(html`<map-card type="local" data='${JSON.stringify(map)}'></map-card>`);
        }
        
        console.log(data);
        document.querySelector(".local-container").classList.remove("loading");
        render(result, document.querySelector(".local-container"));
    });
}

function addScrollListener(element) {
    element.addEventListener('wheel', (event) => {
        event.preventDefault();
        
        element.scrollBy({
            left: event.deltaY < 0 ? -64 : 64,
        });
    });
}

let actual_page = 0;
let loading = false;
function LoadMore(element) {
    element.addEventListener('scroll', (e) => {
        let max_size = (320 * modio_data.length) - 64;
        if(element.scrollLeft >= max_size - 640 && !loading) {
            loading = true;
            actual_page++;
            getModio(actual_page);
        }
    });
}

getModio(actual_page);
getLocal();
window.getLocal = getLocal;

addScrollListener(document.querySelector(".mod-io-container"));
addScrollListener(document.querySelector(".local-container"));

LoadMore(document.querySelector(".mod-io-container"));