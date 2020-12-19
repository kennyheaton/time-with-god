
import fs from "fs";
import path from "path";
import {createServer} from 'http';
import {get} from './http.mjs';
import { getString } from './streamHelpers.mjs';
import zlib from 'zlib';
import { pipeline } from "stream";

const readingPlan = [
    ['Luke.5','Luke.6','Luke.7','Psalms.91-92','Luke.8','Luke.9','Luke.10','Proverbs.19','Luke.11','Luke12','Psalms93-94','Luke.13','Luke.14','Luke.15','Luke.16'],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    ['','','','','','','','','','','','','','','','Revelation.15','Revelation.16;Joel.1','Revelation.17;Joel.2','Revelation.18;Joel.3','Revelation.19','Revelation.20','Revelation.21','Revelation.22','Luke.1','Luke.2','Luke.3','Psalms.84-85','Proverbs.18','Psalms.86-88','Psalms.86-90','Luke.4']
  ];

const mimeTypes = {
  ".js": "text/javascript",
  ".css": "text/css",
  ".html": "text/html",
  ".ico": "image/vnd.microsoft.icon",
  ".png": "image/png",
  ".webmanifest": "application/manifest+json",
};

function return404(response) {
  response.writeHead(404, {
    "Content-Type": "text/html",
  });

  response.end(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Hello</title></head><body><main><h1>404</h1></main></body></html>`);
}

function return500(response, error) {
  response.writeHead(500, {
    "Content-Type": "text/html",
  });

  console.log(error);
  response.end(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Hello</title></head><body><main><h1>500</h1><p>${error}</p></main></body></html>`);
}

function isFileWithReadAccess(filePath) {
  return new Promise(function (resolve, reject) {
    fs.access(filePath, fs.constants.R_OK, function (err) {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

function getFileSize(filePath) {
  return new Promise(function (resolve, reject) {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve(stats.size);
      }
    });
  });
}

async function passage(ref) {
  const apiKey = process.env.NLT_API_KEY | 'TEST';
  const responseStream = await get(`http://api.nlt.to/api/passages?ref=${ref}&key=${apiKey}`);
  return getString(responseStream);
}

function indexTemplate(apiResponse) {
  const scripture = apiResponse
    .replace(/^.*<body>/s, '')
    .replace(/<\/body>.*$/, '')
    .replace(/<a class="a-tn">.*<\/a>/g, '')
    .replace(/<span class="tn">.*?<\/span>.*?<\/span>/gs, '')
    .replace(/<span class="vn">.*?<\/span>/gs, '')
    .replace(/:.*?NLT/g, '')
    .replace(/<p class="chapter-number">.*?<\/p>/gs, '')
  return `<!DOCTYPE html>
  <html lang="en-US">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
      <meta name="apple-mobile-web-app-capable" content="yes">
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  
      <title>Hello</title>
  
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
      <link rel="manifest" href="/site.webmanifest">
  
      <style>
        body {
          font-family: Helvetica, sans-serif;
          font-size: 1.5rem;
          line-height: 2.5rem;
        }
        main {
          display: flex;
          flex-direction: row;
          justify-content: center;
          padding: 0 1rem 5rem 0rem;
        }
        #bibletext {
          max-width: 36rem;
        }
        p {
          margin: 2em 0;
        }
        .body,.body-ch {
          display: inline;
        }
        .poet1,.poet1-vn {
          margin: 0 0 0 4rem;
          font-style: italic;
          text-indent: -3rem;
        }
        .poet1-sp {
          margin: 1rem 0 0 4rem;
          font-style: italic;
          text-indent: -3rem;
        }
        .poet2 {
          margin: 0 0 0 4rem;
          font-style: italic;
          text-indent: -2rem;
        }
        .poet2-sp {
          margin: 1rem 0 0 4rem;
          font-style: italic;
          text-indent: -2rem;
        }
      </style>
    </head>
    <body>
      <main>
        <div id="reading">${scripture}</div>
      </main>
    </body>
  </html>
  `;
}

global.index = { month: null, day: null, page: null };
async function getIndex() {
    const today = new Date();
    const month = today.getMonth();
    const day = today.getDate() - 1;

    if (global.index.month === month && global.index.day === day) {
      return global.index.page;

    } else {
      const scripture = await passage(readingPlan[month][day]);
      const page = indexTemplate(scripture);

      global.index.month = month;
      global.index.day = day;
      global.index.page = page;

      return page;
    }
}

async function requestListener(request, response) {
  const url = request.url;

  console.log(`Request: ${url}`);

  try {
    if (url === '/' || url === '/index.html') {
      const index = await getIndex();

      const expires = new Date();
      expires.setDate(expires.getDate() + 1);
      expires.setHours(0,0,0,0);

      response.writeHead(200, {
        "Content-Type": 'text/html',
        'Content-Length': index.length,
        'Cache-Control': 'public',
        'Expires': expires.toDateString(),
      });

      response.end(index);

    } else {
      const filePath = `src/public${url}`;
      if (await isFileWithReadAccess(filePath)) {
        
        const size = await getFileSize(filePath);

        const expires = new Date();
        expires.setDate(expires.getDate() + 1);
        expires.setHours(0,0,0,0);

        let acceptEncoding = request.headers['accept-encoding'] | '';

        const onError = (err) => {
          if (err) {
            response.end();
            console.error('An error occurred:', err);
          }
        };

        const headers = { 
          "Content-Type": mimeTypes[path.extname(url)],
          "Content-Length": size,
          'Vary': 'Accept-Encoding',
          'Cache-Control': 'public',
          'Expires': expires.toDateString(),
        };

        const raw = fs.createReadStream(filePath);

        if (/\bdeflate\b/.test(acceptEncoding)) {
          response.writeHead(200, { 
            'Content-Encoding': 'deflate',
           headers
          });
          pipeline(raw, zlib.createDeflate(), response, onError);

        } else if (/\bgzip\b/.test(acceptEncoding)) {
          response.writeHead(200, { 
            'Content-Encoding': 'gzip',
           headers
          });
          pipeline(raw, zlib.createGzip(), response, onError);

        } else if (/\bbr\b/.test(acceptEncoding)) {
          response.writeHead(200, { 
            'Content-Encoding': 'br',
           headers
          });
          pipeline(raw, zlib.createBrotliCompress(), response, onError);

        } else {
          response.writeHead(200, headers);
          pipeline(raw, response, onError);
        }

      } else {
        return404(response);
      }
    }
  } catch (error) {
    return500(response, error);
  }
}


const PORT = process.env.PORT || 8080;

const server = createServer();

server.on('request', requestListener);

server.listen(PORT);

console.log(`Server listening on port ${PORT}.`);