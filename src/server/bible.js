const http = require('http');

exports.passage = function(ref) {
    return new Promise(function (resolve, reject) {
        http.get(`http://api.nlt.to/api/passages?ref=${ref}&key=TEST`, function (message) {
            resolve(message);
        }).on('error', function (err) {
            reject(err);
        });
    });
}