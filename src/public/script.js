let request = new XMLHttpRequest();

request.addEventListener("progress", function() {
  console.log(`Progres: ${request.responseText.length}`)
  setInnerHtml('reading', request.responseText
    .replace(/^.*<body>/s, '')
    .replace(/<\/body>.*$/, '')
    .replace(/<a class="a-tn">.*<\/a>/g, '')
    .replace(/<span class="tn">.*?<\/span>.*?<\/span>/gs, '')
    .replace(/<span class="vn">.*?<\/span>/gs, '')
    .replace(/:.*?NLT/g, '')
    .replace(/<p class="chapter-number">.*?<\/p>/gs, '')
    );
});

request.open('GET', '/api/todays-reading');
request.responseType = 'text/html';

request.send();


const cache = {};
let loaded = false;
function setInnerHtml(id, text) {
  console.log(text);
  if (loaded) {
    document.getElementById(id).innerHTML = text;
  } else {
    cache[id] = text;
  }
}

function dumpCache() {
  Object.keys(cache).forEach(function(key) {
    document.getElementById(key).innerHTML = cache[key];
  });
}

document.addEventListener('DOMContentLoaded',function() {
  loaded = true;
  dumpCache();
});
