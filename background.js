var notificationId = 0;
var sixComingSoonCount;
var timeout = 30000;


// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  // No tabs or host permissions needed!
  openStorePageTab();
});

chrome.notifications.onClicked.addListener(function(id) {
  openStorePageTab();
});

function storeAndCompare(response) {
  // Just count how many times the "data-available" element is set to false
  var comingSoonCount = occurrences(response, "data-available=\"false\"");
  chrome.browserAction.setBadgeText({text: comingSoonCount.toString() });

  if (sixComingSoonCount != null) {
    if (comingSoonCount < sixComingSoonCount) {
      // Notify user that something changed!
      showNotification();
    }
  }

  sixComingSoonCount = comingSoonCount;
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

// Loads an url
function loadUrl(url, callback) {
  var x = new XMLHttpRequest();
  x.onload = function() {
      callback(x.responseText);
  };

  x.open('GET', url);
  x.send();
}

function showStartNotification() {
  showNotification("Checking the Google Store for you", "Refreshing the 6P site every " + timeout/1000 + " seconds");
}

function showUpdateNotification() {
  showNotification("Something has changed!", "The Nexus 6P might be available now!");
}

function showNotification(title, message) {
  var opt = {
   type: "basic",
   title: title,
   message: message,
   iconUrl: "icon.png"
  };
  var id = notificationId++;
  chrome.notifications.create(id.toString(), opt, function(id) {});
}

function openStorePageTab() {
  var createProperties = { url: "https://store.google.com/product/nexus_6p" }
  chrome.tabs.create(createProperties, function(tab) {});
}

function refreshContent() {
  console.log("Refresh");
  loadUrl('https://store.google.com/product/nexus_6p', function(response) {
    storeAndCompare(response);
  });
}

// Background loop
function loop(delay) {
  setInterval(function() {
    refreshContent();
  }, delay);
}

// Refresh at start, then loop
refreshContent();
loop(timeout);
showStartNotification();
