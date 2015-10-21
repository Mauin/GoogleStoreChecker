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
