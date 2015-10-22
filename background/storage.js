var cached = 0;

function resetCache() {
  cached = 0;

  syncCache(0);
}

function setCache(lastAvailable) {
  cached = lastAvailable;
}

function processResponse(product, config, dom, callback) {
  var models = parseModels(dom);
  var available = checkAvailability(models, config);

  var wanted = (config === undefined) ? models.length : 1;
  var name = (config === undefined) ? product.name : getProductName(product, config);

  console.log(name + " - " + available + " out of " + wanted + " models available");

  // Nothing to do here
  if (cached == available) {
    return;
  }

  notificationHandling(product, config, cached, available);
  syncCache(available);

  // Store new value
  cached = available;

  callback(available);
}

function checkAvailability(models, config) {
  var available = 0;
  var checkAll = (config === undefined) || config.model === "null";

  for (var i = 0; i < models.length; i++) {
    var current = models[i];
    if ((checkAll || configEquals(current, config)) && current.available === "true") {
      available++;
    }
  }

  return available;
}
