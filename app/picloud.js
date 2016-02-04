var url = require('url');
var WebSocket = require('ws');


var exports = module.exports = {};
exports.socket = socket;


function socket(config) {
    var picloudURL = url.format(config);
    var picloud = new WebSocket(picloudURL);
    return picloud;
}
