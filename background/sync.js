function syncTimestamp(timestamp) {
  chrome.storage.sync.set({
    syncTimestamp: timestamp
  });
}

function syncInterval(interval) {
  chrome.storage.sync.set({
    interval: interval
  });
}

function syncSelectedProduct(product, config) {
  if (config === undefined) {
    config = "null";
  }

  chrome.storage.sync.set({
    selected: product,
    model: config
  });
}

function syncProducts(products) {
  chrome.storage.sync.set({
    productsWithConfiguration: products
  });
}

function getSyncedData(callback) {
  var timestamp;
  var products;
  var selectedProduct;
  var selectedModel;
  var interval;

  // Get synced device refresh timestamp
  chrome.storage.sync.get("syncTimestamp", function(timestamp) {
    if (timestamp.syncTimestamp != undefined) {
      timestamp = timestamp.syncTimestamp;
    }

    // Get synced products
    chrome.storage.sync.get("productsWithConfiguration", function(storedProducts) {
      if (storedProducts.productsWithConfiguration != undefined && storedProducts.productsWithConfiguration.length > 0) {
        products = storedProducts.productsWithConfiguration;
      }

      // Get synced selected model
      chrome.storage.sync.get("model", function(storedModel) {
        var model;
        if (storedModel.model && storedModel.model !== "null") {
          selectedModel = storedModel.model;
        }

        // Get synced selected product
        chrome.storage.sync.get("selected", function(selectedProduct) {
          if (selectedProduct.selected) {
            selectedProduct = selectedProduct.selected;
          }

          // Get synced refresh interval
          chrome.storage.sync.get("interval", function(interval) {
            if (interval.interval) {
              interval = interval.interval;
            } else {
              // TODO Extract constant
              interval = 30000;
            }

            callback(timestamp, products, selectedProduct, selectedModel, interval);
          });
        });
      });
    });
  });
}
