const fs = require("fs");
const path = require("path");
const apis = require("./apis");

const mimeTypes = {
  ".js": "text/javascript",
  ".css": "text/css",
  ".html": "text/html",
  ".ico": "image/vnd.microsoft.icon",
  ".png": "image/png",
  ".webmanifest": "application/manifest+json",
};

function requestListener(request, response) {
  const url = request.url === "/" ? "index.html" : request.url.substring(1);

  console.log(`Request: ${url}`);
  if (url.indexOf("api/") === 0) {
    const [_, mod, func] = url.split("/");
    const api = apis?.[mod]?.[func]?.[request.method.toLowerCase()];
    if (typeof api === "function") {
      if ((request.method === "GET" || request.method === "DELETE")) {
        const result = JSON.stringify(api());
        response.writeHead(200, {
          "Content-Type": "application/json",
          "Content-Length": result.length,
        });
        response.end(result);
      } else if (request.method === "POST" || request.method === "PUT") {
        let data = "";
        request.on("data", function (chunk) {
          data += chunk;
        });
        request.on("end", function () {
          const param = JSON.parse(data);
          const result = JSON.stringify(api(param));
          response.writeHead(200, {
            "Content-Type": "application/json",
            "Content-Length": result.length,
          });
          response.end(result);
        });
      }
    }
  } else {
    try {
      const filePath = `src/public/${url}`;
      fs.access(filePath, fs.constants.R_OK, (err) => {
        if (err) {
          response.writeHead(404, {
            "Content-Type": "text/html",
          });

          response.write(
            `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Hello</title></head><body><main><h1>404</h1></main></body></html>`
          );
          response.end();
          return;
        }

        fs.stat(filePath, (err, stats) => {
          if (err) {
            console.log(err);
          }

          response.writeHead(200, {
            "Content-Type": mimeTypes[path.extname(url)],
            "Content-Length": stats.size,
          });

          const readStream = fs.createReadStream(filePath);

          readStream.pipe(response);
        });
      });
    } catch (error) {
      console.log(error);
      response.write(
        `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Hello</title></head><body><main><h1>500</h1><p>${error}</p></main></body></html>`
      );
    }
  }
}

module.exports = requestListener;
