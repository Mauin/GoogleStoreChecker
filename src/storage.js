var cached = 0;

function processResponse(response, callback) {
  var models = getModelsFromResponse(response);
  console.log(models.length)

  var available = checkAvailability(models);
  console.log(available + " out of " + models.length + " models available");

  // Compare to last value
  if (available != cached) {
    // Show notification on value change
    showUpdateNotification();
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
