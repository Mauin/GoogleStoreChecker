function parseModels(dom) {

  // Find all 'div's with 'data-available' parameters
  configs = dom.find('div[data-available]');

  var configurations = new Array();
  for (var i = 0; i < configs.length; i++) {
    var config = configs[i];

    // Find basic data
    var price = config.dataset.price;
    var available = config.dataset.available;

    // Get configuration data points
    var productConfigurationsData = new Array();
    var configDataPoints = config.childNodes;
    for (var j = 0; j < configDataPoints.length; j++) {
      var name = configDataPoints[j].dataset.variationName;
      productConfigurationsData.push(createConfigurationData(j, name));
    }

    configurations.push(createConfiguration(price, available, productConfigurationsData));
  }

  return configurations;
}

function parseProductName(dom) {
  // Check for the device name again, just to update in case the category overview name was funky
  return dom.find('div[data-tracking-name]')[0].dataset.trackingName;
}

function parseFrontPageItems(dom) {
  // Categories (and products) from the Google Store front pages
  return dom.find('a.block-link');
}

function parseProductsFromCategoryPage(dom) {
  return dom.find('a.flag-button-hover-target');
}

function parseProductsAndCategories(elements, products, callback) {
  var categories = new Array();

  for (var i = 0; i < elements.length; i++) {
    var path = elements[i].pathname;
    if (path === undefined) {
      break;
    }

    if (path.includes(productString)) {
      var name = elements[i].dataset.title;
      addProduct(products, createProduct(name, path));
    } else if (path.includes(categoryString)) {
      categories.push(path);
    }
  }

  callback(products, categories);
}

function addAllProducts(products, toAdd) {
  for (var i = 0; i < toAdd.length; i++) {
    addProduct(products, toAdd[i]);
  }
}

function addProduct(products, product) {
  var contains = false;
  for (var i = 0; i < products.length && !contains; i++) {
    var current = products[i];
    if (equalsProduct(product, current)) {
      contains = true;
    }
  }

  if (!contains) {
    products.push(product);
  }
}
