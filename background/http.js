// Loads an url
function loadUrl(url, callback) {
  var x = new XMLHttpRequest();
  x.onload = function() {
    var response = x.responseText;
    var dom = jQuery('<div/>').html(response).contents();
    callback(dom);
  };

  x.open('GET', url);
  x.send();
}
