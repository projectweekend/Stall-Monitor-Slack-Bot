var url = require('url');
var WebSocket = require('ws');


var exports = module.exports = {};
exports.socket = socket;


function socket(config) {
    var socketURL = url.format(config);
    return new WebSocket(socketURL);
}
