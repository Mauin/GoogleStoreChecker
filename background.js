var refreshInterval;
var lastProductSyncTimestamp;
var availableProducts;
var intervalLoop = false;
var targetProduct;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.products) {
    // List of Products requested
    sendResponse({
      products: availableProducts,
      selected: targetProduct,
      interval: refreshInterval
    });
  }

  if (request.interval) {
    // Timeout selection broadcast
    syncInterval(request.interval);
    refreshInterval = request.interval;
  }

  if (request.product) {
    // Product selection broadcast
    syncSelectedProduct(request.product);
    restartLoop(request.product);
  }
});

chrome.notifications.onClicked.addListener(function(id) {
  openStorePageTab();
});

chrome.browserAction.onClicked.addListener(function() {
  openStorePageTab();
});

function openStorePageTab() {
  var createProperties = {
    url: targetProduct.url
  }
  chrome.tabs.create(createProperties, function(tab) {});
}

function showOptionsDialog() {
  chrome.tabs.create({
    'url': 'chrome://extensions/?options=' + chrome.runtime.id
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

function checkForDeviceUpdateIfNecessary(callback) {
  var now = Date.now();

  if (availableProducts === undefined || now - lastProductSyncTimestamp > productRefreshInterval) {
    lastProductSyncTimestamp = Date.now();
    syncTimestamp(lastProductSyncTimestamp);

    getDevices(callback);
  } else {
    callback(availableProducts);
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
  if (intervalLoop) {
    clearInterval(intervalLoop);
    intervalLoop = false;
    resetCache();
  }

  checkForDeviceUpdateIfNecessary(function(products) {
    availableProducts = products;

    if (product === undefined) {
      showOptionsDialog();
      return;
    }

    targetProduct = product;
    showStartNotification(product);

    refreshContent(product);
    loop(refreshInterval, product);
  });
}


function main() {

  // Get synced device refresh timestamp
  chrome.storage.sync.get("syncTimestamp", function(timestamp) {
    if (timestamp.syncTimestamp != undefined) {
      lastProductSyncTimestamp = timestamp.syncTimestamp;
    }

    // Get synced products
    chrome.storage.sync.get("products", function(storedProducts) {
      if (storedProducts.products != undefined && storedProducts.products.length > 0) {
        availableProducts = storedProducts.products;
      }

      // Get synced selected product
      chrome.storage.sync.get("selected", function(selectedProduct) {
        var targetProduct;
        if (selectedProduct.selected) {
          targetProduct = selectedProduct.selected;
        }

        // Get synced refresh interval
        chrome.storage.sync.get("interval", function(interval) {
          if (interval.interval) {
            refreshInterval = interval.interval;
          } else {
            refreshInterval = 30000;
          }

          // Start the refresh loop
          restartLoop(targetProduct);
        });
      });
    });
  });
}

// Call main method
main();
