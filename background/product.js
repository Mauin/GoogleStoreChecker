/**
 * Defines a Product of the Google Store
 */
function Product() {
  this.name = "";
  this.productUrl = "";
  this.url = "";
  this.configurations = ""; // Configuration array
}

/**
 * Constructor that creates a product
 * @param  {String} name - name of the product
 * @param  {String} path - part of the url to the product landing page
 * @return {Product}      final constructed product
 */
function createProduct(name, path) {
  var product = new Product();
  product.name = name;
  product.productUrl = path;
  product.url = storeUrl + path;
  return product;
}

function equalsProduct(l, r) {
  return (l.name === r.name || l.url === r.url) 
}

function createConfiguration(price, available, data) {
  var configuration = new Configuration();
  configuration.price = price;
  configuration.data = data;
  configuration.available = available;
  return configuration;
}

function configEquals(l, r) {
  var price = l.price == r.price;
  var length = l.data.length == r.data.length;

  if (price && length) {
    // Check all data points

    var equals = true;
    for (var i = 0; i < l.data.length && equals; i++) {
      var lData = l.data[i];
      var rData = r.data[i];

      if (lData.name.localeCompare(rData.name) != 0) {
        equals = false;
      }
    }
    return equals;
  } else {
    return false;
  }
}

function Configuration() {
  this.available = false;
  this.price = "";
  this.data = new Array(); // ConfigurationData array
}

function createConfigurationData(id, name) {
  var configurationData = new ConfigurationData();
  configurationData.id = id;
  configurationData.name = name;
  return configurationData;
}

function ConfigurationData() {
  this.id = "";
  this.name = "";
}

function getProductName(product, config) {
  if (config === undefined) {
    return product.name;
  }

  return product.name + " " + createConfigString(config);
}

function createConfigString(config) {
  var string = "";

  for (var i = 0; i < config.data.length; i++) {
    string += config.data[i].name;

    if (i < config.data.length - 1) {
      string += " ";
    }
  }
  return string;
}
