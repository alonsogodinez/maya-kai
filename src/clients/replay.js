// Test client that sends messages back after a delay
var fs = require('fs');
var WebSocket = require('ws');

var config = require('./../config');
var argv = require('minimist')(process.argv.slice(2), {
    default: {
        port: config.PORT,
        server: config.SERVER,
    },
    alias: {
        port: 'p',
        server: 's',
    },
});

var JSOG = require('./../util/jsog');

var ID = Math.random();
var startTime = new Date().getTime();

var filename = argv[0] || '_actions.log';
console.log('Replaying actions from ', filename);

var actions = JSON.parse('[' + fs.readFileSync(filename, 'utf-8') + 'null]');
var ws = new WebSocket('ws://' + argv.server + ':' + argv.port);
ws.on('open', () => {
    console.log('Starting to replay actions');
    sendMessage();
});

var index = 0;
function sendMessage() {
    if (actions[index] === null || actions[index + 1] === null) {
        console.log('Reached end of activity stream');
        ws.close();
        return;
    }
    setTimeout(sendMessage, actions[index + 1].time - actions[index].time);
    ws.send(JSON.stringify({
        type: config.MSG_EVENT,
        origin: ID,
        payload: actions[index].payload
    }));
    var event = JSOG.parse(actions[index].payload);
    console.log(actions[index].time + ':' + event.topLevelType, event.rootNodeID);
    index++;
}
