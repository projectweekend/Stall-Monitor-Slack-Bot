var fs = require('fs');


var exports = module.exports = {};
exports.fromFile = fromFile;


function fromFile(path) {
    var config = JSON.parse(fs.readFileSync(path));
    return config;
}
