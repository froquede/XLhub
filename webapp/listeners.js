let listeners = {};

window.on = function(event, value) {
    if(listeners[event]) {
        for(let listener of listeners[event]) {
            try {
                listener(value);
            } catch(err) {}
        }
    }
}

window.listen = function(event, callback) {
    if(!listeners[event]) listeners[event] = [];
    listeners[event].push(callback);
}