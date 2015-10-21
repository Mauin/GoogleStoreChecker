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

function createConfiguration(price, data) {
  var configuration = new Configuration();
  configuration.price = price;
  configuration.data = data;
  return configuration;
}

function Configuration() {
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
