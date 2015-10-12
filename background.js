var timeout = 30000;
var colorGreen = "#00C400";
var colorRed = "#F20000";

var storeUrl = "https://store.google.com"

var category = "category";
var product = "product"

var products = new Set();
var categories = new Set();

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    sendResponse({products:Array.from(products)});
});

chrome.notifications.onClicked.addListener(function(id) {
  openStorePageTab();
});

function openStorePageTab() {
  var createProperties = { url: "https://store.google.com/product/nexus_6p" }
  chrome.tabs.create(createProperties, function(tab) {});
}

function refreshContent() {
  loadUrl('https://store.google.com/product/nexus_6p', function(response) {
    processResponse(response, setBadge);
  });
}

function setBadge(count) {
  if (count > 0) {
    chrome.browserAction.setBadgeText({text:count.toString()});
    chrome.browserAction.setBadgeBackgroundColor({color:colorGreen});
  } else {
    chrome.browserAction.setBadgeText({text:":("});
    chrome.browserAction.setBadgeBackgroundColor({color:colorRed});
  }
}

function getDevices() {
  loadUrl(storeUrl, function(response) {
    // Parse DOM
    var dom = jQuery('<div/>').html(response).contents();
    var domCategories = dom.find('a.block-link');

    for(var i = 0; i < domCategories.length; i++) {
      var name = domCategories[i].pathname;
      if (name === undefined) {
        break;
      }

      if (name.includes(product)) {
        products.add(name);
      } else if (name.includes(category)) {
        categories.add(name);
      }
    }
    var catArray = Array.from(categories);
    for (var i = 0; i < catArray.length; i++) {
      var categoryUrl = storeUrl  + catArray[i];

      loadUrl(categoryUrl, function(response) {
        // Parse DOM
        var dom = jQuery('<div/>').html(response).contents();

        // Find all 'div's with 'data-available' parameters
        var devices = dom.find('a.flag-button-hover-target');
        for (var j = 0; j < devices.length; j++) {
          var path = devices[j].pathname;
          if (path.includes(product)) {
            products.add(path);
          }
        }
      });
    }
  });
}

// Background loop
function loop(delay) {
  getDevices();

  setInterval(refreshContent, delay);
}

// Start here. Begin loop!
refreshContent();
loop(timeout);

showStartNotification();
