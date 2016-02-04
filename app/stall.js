var util = require('util');
var EventEmitter = require('events');


var exports = module.exports = {};
exports.Stall = Stall;


function Stall(subSocket, pubSocket) {
    EventEmitter.call(this);

    this.status = null;

    this._subSocket = subSocket;
    this._pubSocket = pubSocket;
    this._setupPicloudSocket();
}
util.inherits(Stall, EventEmitter);

Stall.prototype._setupPicloudSocket = function () {
    var _this = this;
    _this._subSocket.on('open', function() {
        var subMessage = JSON.stringify({
            "action": "subscribe",
            "event": "stall"
        });
        _this._subSocket.send(subMessage);
    });
    _this._subSocket.on('error', function(err) {
        _this.emit('error', err);
    });
    _this._subSocket.on('message', function(data) {
        var message = JSON.parse(data);
        _this.status = message.data;
        _this.emit('ready');
    });
};

Stall.prototype.pooq = function () {
    var pubMessage = JSON.stringify({
        "event": "pooq",
        "data": ""
    });
    this._pubSocket.send(pubMessage);
};
