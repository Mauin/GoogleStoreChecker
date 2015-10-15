var refreshInterval = 30000;
var lastProductSyncTimestamp = "";
var products;
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

function addProduct(product) {
  var contains = false;
  for (var i = 0; i < products.length && !contains; i++) {
    var current = products[i];
    if (current.name === product.name || current.url === product.url) {
      contains = true;
    }
  }

  if (!contains) {
    products.push(product);
  }
}

function checkForDeviceUpdateIfNecessary(callback) {
  var now = Date.now();
  if (products === undefined || now - lastProductSyncTimestamp > productRefreshInterval) {
    getDevices(callback);
  } else {
    callback();
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

  checkForDeviceUpdateIfNecessary(function() {
    if (product === undefined) {
      chrome.tabs.create({
        'url': 'chrome://extensions/?options=' + chrome.runtime.id
      });
      return;
    }

    targetProduct = product;

    refreshContent(product);
    loop(refreshInterval, product);

    showStartNotification(product);
  });
}


function main() {
  chrome.storage.sync.get("syncTimestamp", function(timestamp) {
    if (timestamp.syncTimestamp != undefined) {
      lastProductSyncTimestamp = timestamp.syncTimestamp;
    }

    chrome.storage.sync.get("products", function(storedProducts) {
      if (storedProducts.products != undefined && storedProducts.products.length > 0) {
        products = storedProducts.products;
      }

      chrome.storage.sync.get("selected", function(selectedProduct) {
        var targetProduct;
        if (selectedProduct.selected) {
          targetProduct = selectedProduct.selected;
        }

        chrome.storage.sync.get("interval", function(interval) {
          if (interval.interval) {
            refreshInterval = interval.interval;
          } else {
            refreshInterval = 30000;
          }

          restartLoop(targetProduct);
        });
      });
    });
  });
}

// Call main method
main();
