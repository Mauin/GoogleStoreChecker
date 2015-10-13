var cached = 0;

function resetCache() {
  cache = 0;
}

function processResponse(product, response, callback) {
  var models = getModelsFromResponse(response);
  var available = checkAvailability(models);
  console.log(product + " - " + available + " out of " + models.length + " models available");

  // Compare to last value
  if (available != cached) {
    // Show notification on value change
    showUpdateNotification(product);
  }
  // Store new value
  cached = available;

  callback(available);
}

function getModelsFromResponse(response) {
  // Parse DOM
  var dom = jQuery('<div/>').html(response).contents();

  // Find all 'div's with 'data-available' parameters
  return dom.find('div[data-available]');
}

function checkAvailability(models) {
  var available = 0;
  // Check how many models are available
  for (i = 0; i < models.length; i++) {
    var isAvailable = models[i].dataset.available;
    if (isAvailable === "true") {
      available++;
    }
  }
  return available;
}
