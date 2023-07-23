var log = console.log;
var fs = require('fs');
var log_file = fs.createWriteStream(__dirname + '/app.log', {flags : 'a'});

console.log = function () {
    let l = [getDate(), ...arguments];
    log_file.write(l.join(" ") + '\n');
    log.apply(console, l);
};

function getDate() {
    var now = new Date();

    let day = ('0' + now.getDate()).slice(-2);
    let month = ('0' + (now.getMonth() + 1)).slice(-2);
    let year = ('0' + now.getFullYear()).slice(-2);

    let hour = ('0' + now.getHours()).slice(-2);
    let minute = ('0' + now.getMinutes()).slice(-2);
    let seconds = ('0' + now.getSeconds()).slice(-2);

    return `${day}/${month}/${year} ${hour}:${minute}:${seconds}`;
}

['log', 'warn', 'error'].forEach((methodName) => {
    const originalMethod = console[methodName];
    console[methodName] = (...args) => {
        let initiator = 'unknown place';
        try {
            throw new Error();
        } catch (e) {
            if (typeof e.stack === 'string') {
                let isFirst = true;
                for (const line of e.stack.split('\n')) {
                    const matches = line.match(/^\s+at\s+(.*)/);
                    if (matches) {
                        if (!isFirst) {
                            initiator = matches[1];
                            break;
                        }
                        isFirst = false;
                    }
                }
            }
        }
        initiator = initiator.split('\\');
        initiator = '(' + initiator[initiator.length - 1];

        if (initiator[initiator.length - 1] != ')') {
            initiator += ')';
        }

        originalMethod.apply(console, [initiator, ...args]);
    };
});

process.on('unhandledRejection', (reason, p) => {
    console.error(reason, 'Unhandled Rejection at Promise', p);
}).on('uncaughtException', err => {
    console.error(err, 'Uncaught Exception thrown');
});