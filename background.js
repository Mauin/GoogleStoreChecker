// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  // No tabs or host permissions needed!
  openStorePageTab();
});

function openStorePageTab() {
  var createProperties = { url: "https://store.google.com/product/nexus_6p" }
  chrome.tabs.create(createProperties, function(tab) {});
}

// Loads an url
function loadUrl(url, callback) {
  var x = new XMLHttpRequest();
  x.onload = function() {
      callback(x.responseText);
  };
  x.open('GET', url);
  x.send();
}

function refreshContent() {
  console.log("Refresh");
  loadUrl('https://store.google.com/product/nexus_6p', function(response) {
    storeAndCompare(response);
  });
}

/** Function count the occurrences of substring in a string;
 * @param {String} string   Required. The string;
 * @param {String} subString    Required. The string to search for;
 * @param {Boolean} allowOverlapping    Optional. Default: false;
 * @author Vitim.us http://stackoverflow.com/questions/4009756/how-to-count-string-occurrence-in-string/7924240#7924240
 */
function occurrences(string, subString, allowOverlapping){

    string+=""; subString+="";
    if(subString.length<=0) return string.length+1;

    var n=0, pos=0;
    var step=allowOverlapping?1:subString.length;

    while(true){
        pos=string.indexOf(subString,pos);
        if(pos>=0){ ++n; pos+=step; } else break;
    }
    return n;
}

function showNotification() {
  var opt = {
   type: "basic",
   title: "Something has changed",
   message: "Go check it out!",
   iconUrl: "icon.png"
  };
  var id = notificationId++;
  chrome.notifications.create(id.toString(), opt, function(id) {});
}

function storeAndCompare(response) {
  var comingSoonCount = occurrences(response, "Coming soon");

  if (sixComingSoonCount != null) {
    if (comingSoonCount < sixComingSoonCount) {
      // Notify user that something changed!
      showNotification();
    }
  }

  sixComingSoonCount = comingSoonCount;
}

var notificationId = 0;
var sixComingSoonCount;
var second;
var timeout = 30000;

// Background loop
// TODO Actually loop!
function loop(delay) {
  setInterval(function() {
    refreshContent();
  }, delay);
}

// Refresh at start, then loop
refreshContent();
loop(timeout);
showNotification();
