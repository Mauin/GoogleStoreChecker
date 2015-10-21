var cached = 0;

function resetCache() {
  cached = 0;
}

function processResponse(product, config, response, callback) {
  var models = getModelsFromResponse(response);
  var available = checkAvailability(models, config);

  var wanted = (config === undefined) ? models.length : 1;
  var name = (config === undefined) ? product.name : getModelName(product.name, config);

  console.log(name + " - " + available + " out of " + wanted + " models available");

  notificationHandling(product, cached, available);

  // Store new value
  cached = available;

  callback(available);
}

function getModelName(name, config) {

  return name + " " + createConfigString(config);
}

function createConfigString(config) {
  var string = "";

  for (var i = 0; i < config.data.length; i++) {
    string += config.data[i].name + " ";
  }
  return string;
}

function getModelsFromResponse(response) {
  // Parse DOM
  var dom = jQuery('<div/>').html(response).contents();

  // Find all 'div's with 'data-available' parameters
  configs = dom.find('div[data-available]');

  var configurations = new Array();

  // TODO extract
  for (var i = 0; i < configs.length; i++) {
    var config = configs[i];
    var price = config.dataset.price;
    var available = config.dataset.available;

    var productConfigurationsData = new Array();
    var configDataPoints = config.childNodes;
    for (var j = 0; j < configDataPoints.length; j++) {
      var name = configDataPoints[j].dataset.variationName;
      productConfigurationsData.push(createConfigurationData(j, name));
    }

    var con = createConfiguration(price, available, productConfigurationsData);
    configurations.push(con);
  }

  return configurations;
}

function checkAvailability(models, config) {
  var available = 0;
  var checkAll = (config === undefined);

  for (var i = 0; i < models.length; i++) {
    var current = models[i];
    if ((checkAll || configEquals(current, config)) && current.available === "true") {
      available++;
    }
  }

  return available;
}
