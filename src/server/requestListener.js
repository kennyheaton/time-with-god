const fs = require("fs");
const path = require("path");
const { passage } = require("./bible");
const readingPlan = require('./readingPlan');


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

function streamToResponse(filePath, response) {
  fs.createReadStream(filePath).pipe(response);
}

async function requestListener(request, response) {
  const url = request.url === "/" ? "index.html" : request.url.substring(1);

  console.log(`Request: ${url}`);

  if (url.indexOf("api/") === 0) {

    if (url === 'api/todays-reading') {
      const message = await passage(readingPlan.getTodayRef());

      response.writeHead(200, {
        "Content-Type": 'text/html'
      });

      message.pipe(response);

    } else {
      return404(response);
    }
  } else {
    try {
      const filePath = `src/public/${url}`;
      if (await isFileWithReadAccess(filePath)) {
        
        const size = await getFileSize(filePath);

        response.writeHead(200, {
          "Content-Type": mimeTypes[path.extname(url)],
          "Content-Length": size,
        });

        streamToResponse(filePath, response);

      } else {
        return404(response);
      }
    } catch (error) {
      return500(response, error);
    }
  }
}

module.exports = requestListener;
