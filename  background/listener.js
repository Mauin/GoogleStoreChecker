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
