import { html, render } from 'https://cdn.skypack.dev/lit-html@v3.1.1';
import 'https://unpkg.com/@github/time-elements@3.1.4/dist/index.js?module';
import './loader-animation.js';
import './map-card.js';

const socket = io();
const token = localStorage.getItem("modio-token");
if (!token) {
    document.querySelector(".modio-token").classList.remove("disabled");
    document.body.classList.add("waiting");
}

document.querySelector(".js-send-modio").addEventListener("click", (evt) => {
    let email = (document.querySelector(".js-email").value + '').split(" ").join("");
    if (email.split("@").length > 1 && email.length >= 5) {
        document.querySelector(".input-container").classList.add("loading");
        requestSecurityCode(email);
    }
});

document.querySelector(".js-send-code").addEventListener("click", (evt) => {
    let code = (document.querySelector(".js-code").value + '').split(" ").join("");
    if (code.length == 5) {
        document.querySelector(".input-container").classList.add("loading");
        document.querySelector(".input-container").classList.remove("step2");
        confirmSecurityCode(code);
    }
});

window.modio_filter = { filter: "date_updated", sorting: "desc" };
document.querySelectorAll('.js-filter[type="modio"]').forEach(el => el.addEventListener("click", onFilter));

window.local_filter = { filter: "mtimeMs", sorting: "desc" };
document.querySelectorAll('.js-filter[type="local"]').forEach(el => el.addEventListener("click", onFilter));

function onFilter(event) {
    let target = event.currentTarget;
    let filter = target.getAttribute("data-filter");
    if(target.getAttribute("type") == "local") {
        if (filter == local_filter.filter) {
            toggleLocalSorting();
        }
        else {
            selectLocalSorting(filter);
        }
        
        getLocal(true);
    }
    else {
        if (modio_loading) return;
        
        if (filter == modio_filter.filter) {
            toggleModioSorting(filter);
        }
        else {
            selectModioSorting(filter);
        }
        
        actual_page = 0;
        getModio(actual_page, true);
    }
}

function selectLocalSorting(filter, sorting = "desc") {
    try {
        document.querySelector('[data-tab="' + window.actualTab + '"] [data-filter="' + local_filter.filter + '"][type="local"]').classList.remove("__" + local_filter.sorting);
    } catch(err) {}
    
    local_filter.filter = filter;
    local_filter.sorting = sorting;
    
    document.querySelector('[data-tab="' + window.actualTab + '"] .js-filter.active[type="local"]').classList.remove('active');
    document.querySelector('[data-tab="' + window.actualTab + '"] [data-filter="' + local_filter.filter + '"][type="local"]').classList.add('active');
    document.querySelector('[data-tab="' + window.actualTab + '"] [data-filter="' + local_filter.filter + '"][type="local"]').classList.add("__" + local_filter.sorting);
}

window.selectLocalSorting = selectLocalSorting;

function selectModioSorting(filter, sorting = "desc") {
    document.querySelector('[data-tab="' + window.actualTab + '"] [data-filter="' + modio_filter.filter + '"][type="modio"]').classList.remove("__" + modio_filter.sorting);
    
    modio_filter.filter = filter;
    modio_filter.sorting = sorting;
    
    document.querySelector('[data-tab="' + window.actualTab + '"] .js-filter.active[type="modio"]').classList.remove('active');
    document.querySelector('[data-tab="' + window.actualTab + '"] [data-filter="' + modio_filter.filter + '"][type="modio"]').classList.add('active');
    document.querySelector('[data-tab="' + window.actualTab + '"] [data-filter="' + modio_filter.filter + '"][type="modio"]').classList.add("__" + modio_filter.sorting);
}

window.selectModioSorting = selectModioSorting;

function toggleLocalSorting() {
    document.querySelector('[data-tab="' + window.actualTab + '"] [data-filter="' + local_filter.filter + '"][type="local"]').classList.remove("__" + local_filter.sorting);
    local_filter.sorting = local_filter.sorting == "desc" ? "asc" : "desc";
    document.querySelector('[data-tab="' + window.actualTab + '"] [data-filter="' + local_filter.filter + '"][type="local"]').classList.add("__" + local_filter.sorting);
}

function toggleModioSorting() {
    document.querySelector('[data-tab="' + window.actualTab + '"] [data-filter="' + modio_filter.filter + '"][type="modio"]').classList.remove("__" + modio_filter.sorting);
    modio_filter.sorting = modio_filter.sorting == "desc" ? "asc" : "desc";
    document.querySelector('[data-tab="' + window.actualTab + '"] [data-filter="' + modio_filter.filter + '"][type="modio"]').classList.add("__" + modio_filter.sorting);
}

function requestSecurityCode(email) {
    const data = new URLSearchParams();
    data.append("email", email);
    fetch("https://api.mod.io/v1/oauth/emailrequest?api_key=90e38aa08fbdc38b9c2e8d3e4cf3c914", {
    method: 'POST',
    body: data,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
}).then(response => response.json()).then(data => {
    if(!data.error) {
        if(data.code == 200) {
            document.querySelector(".input-container").classList.remove("loading");
            document.querySelector(".input-container").classList.add("step2");
            document.querySelector(".js-code-message").innerHTML = data.message;
            document.querySelector(".js-code-message").classList.remove("disabled");
        }
    }
    else{
        alert(data.error.message);
    }
}).catch(err => {
    alert(err);
})
}

function confirmSecurityCode(code) {
    const data = new URLSearchParams();
    data.append("security_code", code);
    fetch("https://api.mod.io/v1/oauth/emailexchange?api_key=90e38aa08fbdc38b9c2e8d3e4cf3c914", {
    method: 'POST',
    body: data,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
}).then(response => response.json()).then(data => {
    if(!data.error) {
        if(data.code == 200) {
            localStorage.setItem("modio-token", data.access_token);
            window.location.reload();
        }
    }
    else{
        document.querySelector(".input-container").classList.remove("loading");
        document.querySelector(".input-container").classList.add("step2");
        alert(data.error.message);
    }
}).catch(err => {
    alert(err);
})
}

socket.on("download-percentage", message => { window.on("download-percentage", message); })
socket.on("extracting-download", message => { window.on("extracting-download", message); })
socket.on("extracting-finished", message => { 
    window.on("extracting-finished", message);
    getLocal();
});
socket.on("mod-list-updated", message => {
    window.config.mods = message;
    console.log(window.config.mods, "mod list updated");
});

let modio_data = []
let controllerModio;
let modio_loading = false;
let first_load = true;
window.actualTab = "maps";

function getModio(page = 0, refresh) {
    modio_loading = true;
    try {
        controllerModio.abort();
    } catch(err) {}
    
    controllerModio = new AbortController();
    let { signal } = controllerModio;

    if (refresh) modio_data = [];
    let container = document.querySelector('[data-tab="' + window.actualTab + '"] .mod-io-container');
    container.classList.add("loading");
    if (!first_load && !refresh) {
        modio_data.push(html`<loader-animation></loader-animation>`);
        vrender(modio_data, container);
    }
    else first_load = false;
    
    let url = "/modio/" + window.actualTab + "?page=" + page + "&token=" + localStorage.getItem("modio-token") + "&filter=" + modio_filter.filter + "&sorting=" + modio_filter.sorting + "&search=" + modio_search;
    window.fetch(url, { signal }).then(res => res.json()).then(data => {    
        if(data.response_status && data.response_status == 401 && localStorage.getItem("modio-token")) {
            localStorage.clear();
            window.location.reload();
        }

        for(let map of data.data) {
            modio_data.push(html`<map-card .data='${map}' data-id="${map.id}"></map-card>`);
        }

        if (data.data.length == 0 && page == 0) {
            modio_data.push(html`<p class="no-data">No results found</p>`);
        }
        
        container.classList.remove("loading");
        vrender(modio_data, container);
        
        if(refresh) scrollStartModio();
        
        setTimeout(() => {modio_loading = false;}, 0);
    }).catch(() => {

    });
}

function vrender(data, container) {
    setTimeout(() => {
        render(data, container);
    }, 0);
}

function scrollStartModio() {
    document.querySelector('[data-tab="' + window.actualTab + '"] .mod-io-container').scrollTo({left: 0, behavior: 'smooth'});
}
window.scrollStartModio = scrollStartModio;

function getLocal(refresh = false) {
    let container = document.querySelector('[data-tab="' + window.actualTab + '"] .local-container');
    console.log(container);
    container.classList.add("loading");

    window.fetch("/local/" + window.actualTab + "?filter=" + local_filter.filter + "&sorting=" + local_filter.sorting).then(res => res.json()).then(data => {
        let result = [];
        for(let key in data) {
            let map = data[key];
            map.name = key;
            result.push(html`<map-card type="local" name="${map.name}" data='${JSON.stringify(map)}'></map-card>`);
        }

        let nodata = document.querySelector('[data-tab="' + window.actualTab + '"] .local-container .no-data');
        if(result.length == 0) nodata.classList.remove("hidden");
        else nodata.classList.add("hidden");

        container.classList.remove("loading");
        vrender(result, container);
        
        if(refresh) scrollStartLocal();
        
        if(document.querySelector('[data-tab="' + window.actualTab + '"] .js-search-local').value.split(" ").join("").length > 0) searchLocal();
    });
}

function scrollStartLocal() {
    document.querySelector('[data-tab="' + window.actualTab + '"] .local-container').scrollTo({left: 0, behavior: 'smooth'});
}
window.scrollStartLocal = scrollStartLocal;

function addScrollListener(element) {
    element.addEventListener('wheel', (event) => {
        event.preventDefault();
        
        element.scrollBy({
            left: event.deltaY < 0 ? -64 : 64,
        });
    });
}

let actual_page = 0;
function LoadMore(element) {
    element.addEventListener('scroll', (e) => {
        let max_size = (320 * modio_data.length) - 64;
        if(element.scrollLeft + window.innerWidth >= max_size && !modio_loading) {
            actual_page++;
            getModio(actual_page);
        }
    });
}

function getMe() {
    window.fetch("https://api.mod.io/v1/me", { headers: { Authorization: "Bearer " + localStorage.getItem("modio-token") }}). then(res => res.json()).then(data => {
    document.querySelector(".js-username").innerHTML = data.username;
    document.querySelector(".js-avatar").setAttribute("src", data.avatar.thumb_100x100);
    document.querySelector(".avatar.hidden").classList.remove("hidden");
});
}

let modio_search = "";
function searchModio() {
    modio_search = document.querySelector('[data-tab="' + window.actualTab + '"] .js-search-modio').value;
    actual_page = 0;
    getModio(actual_page, true);
}

function searchLocal() {
    let value = document.querySelector('[data-tab="' + window.actualTab + '"] .js-search-local').value;
    let cards = document.querySelectorAll('[data-tab="' + window.actualTab + '"] .local-container map-card');
    let found = 0;

    for(let i = 0; i < cards.length; i++) {
        let name = cards[i].getAttribute("name");
        var actual = latinize(name.toLowerCase());
        var stringfilter = latinize(value.toLowerCase());
        var re = new RegExp(stringfilter, 'g');
        var res = actual.match(re);
        if (res == null) cards[i].classList.add("hidden");
        else {
            cards[i].classList.remove("hidden");
            found++;
        }
    }

    if(found == 0) {       
        document.querySelector('[data-tab="' + window.actualTab + '"] .local-container .no-data').classList.remove("hidden");
    }
    else {
        document.querySelector('[data-tab="' + window.actualTab + '"] .local-container .no-data').classList.add("hidden");
    }
}

window.user_ratings = {};
function getRatings() {
    fetch("/modio/ratings?token=" + localStorage.getItem("modio-token")).then(response => response.json()).then(data => {
        if(!data.error) { window.user_ratings = data; }
    });
}

getRatings();

window.user_subscriptions = {};
function getSubscriptions() {
    fetch("/modio/subscriptions?token=" + localStorage.getItem("modio-token")).then(response => response.json()).then(data => {
        if(!data.error) { window.user_subscriptions = data; }
        getModio(actual_page);
    });
}

document.querySelectorAll(".js-search-modio").forEach(el => el.addEventListener("keydown", (evt) => {
    if(evt.key === "Enter") searchModio();
}));

document.querySelectorAll(".js-search-local").forEach(el => el.addEventListener("keydown", (evt) => {
    if(evt.key === "Enter") searchLocal();
}));

document.querySelectorAll(".js-search-local-img").forEach(el => el.addEventListener("click", searchLocal));

window.getModio = getModio
window.getLocal = getLocal;

document.querySelectorAll(".mod-io-container").forEach(el => {
    addScrollListener(el);
    LoadMore(el);
});

document.querySelectorAll(".local-container").forEach(el => {
    addScrollListener(el);
});

getMe();
getSubscriptions();
getLocal();