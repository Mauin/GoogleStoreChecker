var refreshInterval;
var lastProductSyncTimestamp;
var availableProducts;
var intervalLoop = false;
var targetProduct;

/**
 * Adds listener to messages from the options page
 */
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

/**
 * Adds listener to browser action click and opens the Google Store page
 */
chrome.notifications.onClicked.addListener(function(id) {
  openStorePageTab();
});

/**
 * Adds listener to browser action click and opens the Google Store page
 */
chrome.browserAction.onClicked.addListener(function() {
  openStorePageTab();
});

/**
 * Opens the Google Store page of the currently selected product
 */
function openStorePageTab() {
  var createProperties = {
    url: targetProduct.url
  }
  chrome.tabs.create(createProperties, function(tab) {});
}

/**
 * Shows the options dialog of the extension
 */
function showOptionsDialog() {
  chrome.tabs.create({
    'url': 'chrome://extensions/?options=' + chrome.runtime.id
  });
}

/**
 * Sets the number in the icon badge to the given value
 * @param {integer} count number to set the badge to
 */
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

/**
 * Checks if a device update is necessary and performs one if it is, otherwise
 * returns the currently cached device list via the given callback
 * @param  {function} callback Callback to send the products to
 */
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

/**
 * Refreshes the current device content
 * @param  {Product} product the selected product to refresh the data for
 */
function refreshContent(product) {
  loadUrl(product.url, function(response) {
    processResponse(product, response, setBadge);
  });
}

/**
 * Basic event-loop for the extension. Will call the refresh method in a regular
 * interval to refresh data for the given product.
 * @param  {integer} delay  interval to repeat the refresh in
 * @param  {Product} product Currently selected product
 */
function loop(delay, product) {
  intervalLoop = setInterval(function() {
    refreshContent(product);
  }, delay);
}

/**
 * Restarts the event-loop for the given product. If a loop is already running,
 * will stop the running one.
 * @param  {Product} product Product to use for the new event-loop
 */
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

/**
 * Main Method of the extension, will get all the synced data and select
 * defaults if none is found.
 *
 * Will then start the event-loop for the given product.
 */
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
