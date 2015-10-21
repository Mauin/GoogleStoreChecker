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

function syncSelectedProduct(product) {
  chrome.storage.sync.set({
    selected: product
  });
}

function syncProducts(products) {
  chrome.storage.sync.set({
    productsWithConfiguration: products
  });
}
