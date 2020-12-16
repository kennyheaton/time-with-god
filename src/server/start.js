const http = require('http');
const requestListener = require('./requestListener');

const PORT = process.env.PORT || 8080;

const server = http.createServer();

server.on('request', requestListener);

server.listen(PORT);

console.log(`Server listening on port ${PORT}.`);
