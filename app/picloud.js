var util = require('util');
var EventEmitter = require('events');


var exports = module.exports = {};
exports.PiCloud = PiCloud;


function PiCloud(socket) {
    EventEmitter.call(this);

    this._socket = socket;
    this._setupPicloudSocket();
}
util.inherits(PiCloud, EventEmitter);

PiCloud.prototype._setupPicloudSocket = function () {
    var _this = this;
    _this._subSocket.on('open', function() {
        _this.emit('ready');
    });
    _this._subSocket.on('error', function(err) {
        _this.emit('error', err);
    });
};

PiCloud.prototype.pooq = function () {
    var pubMessage = JSON.stringify({
        "event": "pooq",
        "data": ""
    });
    this._socket.send(pubMessage);
};
