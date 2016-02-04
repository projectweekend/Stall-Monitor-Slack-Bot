var util = require('util');
var EventEmitter = require('events');


var exports = module.exports = {};
exports.Stall = Stall;


function Stall(pcSocket) {
    EventEmitter.call(this);

    this.status = null;

    this._socket = pcSocket;
    this._setupPicloudSocket();
}
util.inherits(Stall, EventEmitter);

Stall.prototype._setupPicloudSocket = function () {
    var _this = this;
    _this._socket.on('open', function() {
        var subMessage = JSON.stringify({
            "action": "subscribe",
            "event": "stall"
        });
        _this._socket.send(subMessage);
    });
    _this._socket.on('error', function(err) {
        _this.emit('error', err);
    });
    _this._socket.on('message', function(data) {
        var message = JSON.parse(data);
        if (message.data != _this.status) {
            _this.status = message.data;
            _this.emit(_this.status);
        }
        _this.emit('ready');
    });
};
