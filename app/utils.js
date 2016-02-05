var url = require('url');
var WebSocket = require('ws');


var exports = module.exports = {};
exports.socket = socket;
exports.randomFromArray = randomFromArray;


function socket(config) {
    var socketURL = url.format(config);
    return new WebSocket(socketURL);
}


function randomFromArray(a) {
    var i = Math.floor(Math.random() * (a.length - 0));
    return a[i];
}
