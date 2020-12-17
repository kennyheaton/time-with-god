let request = new XMLHttpRequest();

request.addEventListener("progress", function() {
  console.log(`Progres: ${request.responseText.length}`)
  setInnerHtml('reading', request.responseText);
});
request.addEventListener("loadend", function() {
  console.log(`Done: ${request.responseText.length}`)
  setInnerHtml('reading', request.responseText);
});

request.open('GET', '/api/todays-reading');
request.responseType = 'text/html';

request.send();


const cache = {};
let loaded = false;
function setInnerHtml(id, text) {
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
