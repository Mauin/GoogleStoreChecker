var timeout = 30000;
var colorGreen = "#00C400";
var colorRed = "#F20000";

var storeUrl = "https://store.google.com"

var categoryString = "category";
var productString = "product"

var products = new Set();
var categories = new Set();

var targetName = "nexus_6p"
var targetProduct = "/product/nexus_6p";
var targetUrl = "https://store.google.com/product/nexus_6p";

var intervalLoop = false;

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    if (request.products) {
      // List of Products requested
      sendResponse({
        products: Array.from(products)
      });
    } else if (request.product) {
      // Product selection broadcast
      var productUrl = request.product;
      selectProduct(productUrl);
      restartLoop();
    }
  });

function selectProduct(productUrl) {
  targetProduct = productUrl;
  targetUrl = storeUrl + productUrl;
  targetName = productUrl.replace("/product/", '');
}

chrome.notifications.onClicked.addListener(function(id) {
  openStorePageTab();
});

function openStorePageTab() {
  var createProperties = {
    url: targetUrl
  }
  chrome.tabs.create(createProperties, function(tab) {});
}

function refreshContent() {
  loadUrl(targetUrl, function(response) {
    processResponse(targetName, response, setBadge);
  });
}

function setBadge(count) {
  if (count > 0) {
    chrome.browserAction.setBadgeText({
      text: count.toString()
    });
    chrome.browserAction.setBadgeBackgroundColor({
      color: colorGreen
    });
  } else {
    chrome.browserAction.setBadgeText({
      text: ":("
    });
    chrome.browserAction.setBadgeBackgroundColor({
      color: colorRed
    });
  }
}

// TODO refactor and extract
function getDevices() {
  loadUrl(storeUrl, function(response) {
    // Parse DOM
    var dom = jQuery('<div/>').html(response).contents();
    var domCategories = dom.find('a.block-link');

    for (var i = 0; i < domCategories.length; i++) {
      var name = domCategories[i].pathname;
      if (name === undefined) {
        break;
      }

      if (name.includes(productString)) {
        products.add(name);
      } else if (name.includes(categoryString)) {
        categories.add(name);
      }
    }
    var catArray = Array.from(categories);
    for (var i = 0; i < catArray.length; i++) {
      var categoryUrl = storeUrl + catArray[i];

      loadUrl(categoryUrl, function(response) {
        // Parse DOM
        var dom = jQuery('<div/>').html(response).contents();

        // Find all 'div's with 'data-available' parameters
        var devices = dom.find('a.flag-button-hover-target');
        for (var j = 0; j < devices.length; j++) {
          var path = devices[j].pathname;
          if (path.includes(productString)) {
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

  intervalLoop = setInterval(refreshContent, delay);
}

function restartLoop() {
  if (intervalLoop) {
    clearInterval(intervalLoop);
    intervalLoop = false;
    resetCache();
  }

  refreshContent();
  loop(timeout);

  showStartNotification(targetName);
}

restartLoop();
