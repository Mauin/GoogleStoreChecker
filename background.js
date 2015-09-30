var timeout = 30000;

chrome.browserAction.onClicked.addListener(function(tab) {
  // No tabs or host permissions needed!
  openStorePageTab();
});

chrome.notifications.onClicked.addListener(function(id) {
  openStorePageTab();
});

function openStorePageTab() {
  var createProperties = { url: "https://store.google.com/product/nexus_6p" }
  chrome.tabs.create(createProperties, function(tab) {});
}

function refreshContent() {
  console.log("Refresh");
  loadUrl('https://store.google.com/product/nexus_6p', function(response) {
    processResponse(response, setBadge);
  });
}

function setBadge(count) {
  if (count > 0) {
    chrome.browserAction.setBadgeText({text:count.toString()});
    chrome.browserAction.setBadgeBackgroundColor({color:"#00C400"});
  } else {
    chrome.browserAction.setBadgeText({text:":("});
    chrome.browserAction.setBadgeBackgroundColor({color:"#F20000"});
  }
}

// Background loop
function loop(delay) {
  setInterval(function() {
    refreshContent();
  }, delay);
}

// Start here. Begin loop!
refreshContent();
loop(timeout);

showStartNotification();
