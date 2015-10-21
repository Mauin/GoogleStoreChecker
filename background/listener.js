/**
 * Sets up all listeners this extension has in the background page
 */
function addListeners() {
  addMessageListener();
  addNotificationClickListener();
  addBrowserIconClickListener();
}

/**
 * Adds listener to messages from the options page
 */
function addMessageListener() {
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.products) {
      // List of Products requested
      sendResponse({
        products: availableProducts,
        selected: targetProduct,
        interval: refreshInterval,
        config: targetModel
      });
    }

    if (request.interval) {
      // Timeout selection broadcast
      syncInterval(request.interval);
      refreshInterval = request.interval;
    }

    if (request.product) {
      var config;
      if (request.config) {
        // Config selection
        config = request.config;
      }

      // Product selection broadcast
      syncSelectedProduct(request.product, config);
      setTargetProduct(request.product, config);
      restartLoop(request.product, config);
    }
  });
}

/**
 * Adds listener to browser action click and opens the Google Store page
 */
function addNotificationClickListener() {
  chrome.notifications.onClicked.addListener(function(id) {
    openStorePageTab();
  });
}

/**
 * Adds listener to browser action click and opens the Google Store page
 */
function addBrowserIconClickListener() {
  chrome.browserAction.onClicked.addListener(function() {
    openStorePageTab();
  });
}
