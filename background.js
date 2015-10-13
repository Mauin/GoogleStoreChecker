var timeout = 30000;
var productRefreshInterval = 86400000;
var colorGreen = "#00C400";
var colorRed = "#F20000";

var storeUrl = "https://store.google.com"

var categoryString = "category";
var productString = "product"

var lastProductSyncTimestamp = "";
var products = new Set();
var categories = new Set();

var targetProduct = "";

var intervalLoop = false;

function Product() {
  this.name = "";
  this.productUrl = "";
  this.url = "";
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    if (request.products) {
      // List of Products requested
      console.log(products);
      sendResponse({
        products: Array.from(products),
        selected: targetProduct
      });
    } else if (request.product) {
      // Product selection broadcast
      setTargetProduct(request.product);

      chrome.storage.sync.set({
        selected: targetProduct
      });

      restartLoop();
    }
  }
);

chrome.notifications.onClicked.addListener(function(id) {
  openStorePageTab();
});

function setTargetProduct(product) {
  targetProduct = product;
}

function openStorePageTab() {
  var createProperties = {
    url: targetUrl
  }
  chrome.tabs.create(createProperties, function(tab) {});
}

function refreshContent() {
  loadUrl(targetProduct.url, function(response) {
    processResponse(targetProduct, response, setBadge);
  });
}

function setBadge(count) {
  chrome.browserAction.setBadgeText({
    text: count.toString()
  });
  if (count > 0) {
    chrome.browserAction.setBadgeBackgroundColor({
      color: colorGreen
    });
  } else {
    chrome.browserAction.setBadgeBackgroundColor({
      color: colorRed
    });
  }
}

function setAndSyncTimeStamp() {
  lastProductSyncTimestamp = Date.now();
  chrome.storage.sync.set({
    syncTimestamp: lastProductSyncTimestamp
  });
}

// TODO refactor and extract
function getDevices() {
  setAndSyncTimeStamp();

  loadUrl(storeUrl, function(response) {
    // Parse DOM
    var dom = jQuery('<div/>').html(response).contents();
    var domCategories = dom.find('a.block-link');

    for (var i = 0; i < domCategories.length; i++) {
      var path = domCategories[i].pathname;
      if (path === undefined) {
        break;
      }

      if (path.includes(productString)) {
        var name = domCategories[i].dataset.title;
        products.add(createProduct(name, path));
      } else if (path.includes(categoryString)) {
        categories.add(path);
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
          var name = devices[j].dataset.title;
          var path = devices[j].pathname;
          if (path.includes(productString)) {
            products.add(createProduct(name, path));
          }

          // We're done here
          if (i == catArray.length && j == devices.length) {
            chrome.storage.sync.set({
              products: Array.from(products)
            });
          }
        }
      });
    }
  });
}

function createProduct(name, path) {
  var product = new Product();
  product.name = name;
  product.productUrl = path;
  product.url = storeUrl + path;
  return product;
}

function checkForDeviceUpdate() {
  var now = Date.now();
  if (now - lastProductSyncTimestamp > productRefreshInterval) {
    console.log("refreshing devices");
    getDevices();
  }
}

// Background loop
function loop(delay) {
  intervalLoop = setInterval(refreshContent, delay);
}

function restartLoop() {
  if (intervalLoop) {
    clearInterval(intervalLoop);
    intervalLoop = false;
    resetCache();
  }

  checkForDeviceUpdate();
  refreshContent();
  loop(timeout);

  showStartNotification(targetProduct);
}


function main() {
  chrome.storage.sync.get("syncTimestamp", function(timestamp) {
    if (timestamp.syncTimestamp != undefined) {
      lastProductSyncTimestamp = timestamp.syncTimestamp;
    }

    chrome.storage.sync.get("products", function(storedProducts) {
      if (storedProducts.products != undefined && storedProducts.products.length > 0) {
        console.log("array from " + storedProducts.products);
        products = new Set(storedProducts.products);
      } else {
        getDevices();
      }

      chrome.storage.sync.get("selected", function(selectedProduct) {
        if (selectedProduct.selected) {
          setTargetProduct(selectedProduct.selected);
        } else {
          // TODO select a smarter default
          setTargetProduct(createProduct("Nexus 6P", "/product/nexus_6p"));
        }

        restartLoop();
      });
    });
  });
}

// Call main method
main();
