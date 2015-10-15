var refreshInterval = 30000;
var lastProductSyncTimestamp = "";
var products = new Array();
var intervalLoop = false;
var targetProduct;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.products) {
    // List of Products requested
    sendResponse({
      products: products,
      selected: targetProduct,
      interval: refreshInterval
    });
  }

  if (request.interval) {
    // Timeout selection broadcast
    console.log("Interval");
    chrome.storage.sync.set({
      interval: request.interval
    });
    refreshInterval = request.interval;
  }

  if (request.product) {
    // Product selection broadcast
    chrome.storage.sync.set({
      selected: request.product
    });
    restartLoop(request.product);
  }
});

chrome.notifications.onClicked.addListener(function(id) {
  openStorePageTab();
});

chrome.browserAction.onClicked.addListener(function() {
  console.log("clicked icon");
  openStorePageTab();
});

function openStorePageTab() {
  var createProperties = {
    url: targetProduct.url
  }
  chrome.tabs.create(createProperties, function(tab) {});
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

  products = new Array();
  var categories = new Set();

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
        addProduct(createProduct(name, path));
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
            addProduct(createProduct(name, path));
          }

          // We're done here - sync everything
          if (i == catArray.length && j == devices.length) {
            chrome.storage.sync.set({
              products: products
            });
          }
        }
      });
    }
  });
}

function addProduct(product) {
  var contains = false;
  for (var i = 0; i < products.length && !contains; i++) {
    var current = products[i];
    if (current.name === product.name) {
      contains = true;
    }
  }

  if (!contains) {
    products.push(product);
  }
}

function checkForDeviceUpdateIfNecessary() {
  var now = Date.now();
  if (now - lastProductSyncTimestamp > productRefreshInterval) {
    console.log("refreshing product list");
    getDevices();
  }
}


function refreshContent(product) {
  loadUrl(product.url, function(response) {
    processResponse(product, response, setBadge);
  });
}

function loop(delay, product) {
  intervalLoop = setInterval(function() {
    refreshContent(product);
  }, delay);
}

function restartLoop(product) {
  targetProduct = product;

  if (intervalLoop) {
    clearInterval(intervalLoop);
    intervalLoop = false;
    resetCache();
  }

  checkForDeviceUpdateIfNecessary();
  refreshContent(product);
  loop(refreshInterval, product);

  showStartNotification(product);
}


function main() {
  chrome.storage.sync.get("syncTimestamp", function(timestamp) {
    if (timestamp.syncTimestamp != undefined) {
      lastProductSyncTimestamp = timestamp.syncTimestamp;
    }

    chrome.storage.sync.get("products", function(storedProducts) {
      if (storedProducts.products != undefined && storedProducts.products.length > 0) {
        products = storedProducts.products;
      } else {
        getDevices();
      }

      chrome.storage.sync.get("selected", function(selectedProduct) {
        var targetProduct;
        if (selectedProduct.selected) {
          targetProduct = selectedProduct.selected;
        } else {
          // TODO select a smarter default
          targetProduct = createProduct("Nexus 6P", "/product/nexus_6p");
        }

        restartLoop(targetProduct);
      });
    });
  });
}

// Call main method
main();
