import http from 'http';
import zlib from 'zlib';

function get(url) {
    return new Promise((resolve, reject) => {
        http.get(url, {
            headers : {
                'Accept': '*/*',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'en-US,en;q=0.5',
                'Connection': 'keep-alive',
            },
        }, (incomingMessage) => {
            const contentEncoding = incomingMessage.headers['content-encoding'] || incomingMessage.headers['Content-Encoding'];
            switch (contentEncoding) {
                case 'br':
                    resolve(incomingMessage.pipe(zlib.createBrotliDecompress()));
                    break;
                case 'gzip':
                    resolve(incomingMessage.pipe(zlib.createGunzip()));
                    break;
                case 'deflate':
                    resolve(incomingMessage.pipe(zlib.createInflate()));
                    break;
                default:
                    resolve(incomingMessage);
            }
        }).on('error', (err) => {
            reject(err);
        });
    });
}

export { get };