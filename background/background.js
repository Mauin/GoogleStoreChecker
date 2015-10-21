var refreshInterval;
var lastProductSyncTimestamp;
var availableProducts;
var intervalLoop = false;
var targetProduct;

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

  if (true || availableProducts === undefined || now - lastProductSyncTimestamp > productRefreshInterval) {
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

    setTargetProduct(product);
    showStartNotification(product);

    refreshContent(product);
    loop(refreshInterval, product);
  });
}

function setTargetProduct(product) {
  targetProduct = product;
}

/**
 * Main Method of the extension, will get all the synced data and select
 * defaults if none is found.
 *
 * Will then start the event-loop for the given product.
 */
function main() {
  addListeners();

  // Get synced device refresh timestamp
  chrome.storage.sync.get("syncTimestamp", function(timestamp) {
    if (timestamp.syncTimestamp != undefined) {
      lastProductSyncTimestamp = timestamp.syncTimestamp;
    }

    // Get synced products
    chrome.storage.sync.get("productsWithConfiguration", function(storedProducts) {
      if (storedProducts.productsWithConfiguration != undefined && storedProducts.productsWithConfiguration.length > 0) {
        availableProducts = storedProducts.productsWithConfiguration;
      }

      // Get synced selected product
      chrome.storage.sync.get("selected", function(selectedProduct) {
        if (selectedProduct.selected) {
          setTargetProduct(selectedProduct.selected);
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
