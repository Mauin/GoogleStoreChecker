// Loads an url
function loadUrl(url, callback) {
  var x = new XMLHttpRequest();
  x.onload = function() {
      callback(x.responseText);
  };

  x.open('GET', url);
  x.send();
}
