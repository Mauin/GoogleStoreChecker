function getDevices(callback) {
  var products = new Array();
  var remaining = 0;

  console.log("Refreshing devices list");

  findCategories(function(foundProducts, categories) {
    addAllProducts(products, foundProducts);

    findProductInCategories(categories, function(foundProducts) {
      addAllProducts(products, foundProducts);

      findProductConfigurations(products, function(productsWithConfiguration) {
        syncProducts(productsWithConfiguration);
        callback(productsWithConfiguration);
      });

    });

  });
}

function findProductConfigurations(products, callback) {
  var remaining = products.length;
  for (var i = 0; i < products.length; i++) {
    var product = products[i]
    findConfigurations(product, function(configurations) {
      remaining--;
      if (remaining == 0) {
        callback(products);
      }
    });
  }
}

function findConfigurations(product, callback) {
  loadUrl(product.url, function(response) {
    var dom = jQuery('<div/>').html(response).contents();
    var configs = dom.find('div[data-available]');

    // Check for the device name again, just to update in case the category overview name was funky
    var produtName = dom.find('div[data-tracking-name]')[0].dataset.trackingName;


    var configurations = new Array();
    for (var i = 0; i < configs.length; i++) {
      var config = configs[i];
      var price = config.dataset.price;

      var productConfigurationsData = new Array();
      var configDataPoints = config.childNodes;
      for (var j = 0; j < configDataPoints.length; j++) {
        var name = configDataPoints[j].dataset.variationName;
        productConfigurationsData.push(createConfigurationData(j, name));
      }

      configurations.push(createConfiguration(price, productConfigurationsData));
    }

    // Set data to product
    product.name = produtName;
    product.configurations = configurations;

    callback(configurations);
  });
}

function findProductInCategories(categories, callback) {
  var products = new Array();

  var remaining = categories.length;
  // Find products in every category
  for (var i = 0; i < categories.length; i++) {
    var categoryUrl = storeUrl + categories[i];

    findProductsForCategory(categoryUrl, products, function(foundProducts, categories) {
      addAllProducts(products, foundProducts);

      remaining--;
      if (remaining == 0) {
        callback(products);
      }
    });
  }
}

function findProductsForCategory(categoryUrl, products, callback) {
  findElements(categoryUrl, products, function(response) {
    var dom = jQuery('<div/>').html(response).contents();
    // Find all 'div's with 'data-available' parameters
    return dom.find('a.flag-button-hover-target');
  }, callback);
}

function findCategories(callback) {
  var products = new Array();

  // Find categories (and products from the front page)
  findElements(storeUrl, products, function(response) {
    var dom = jQuery('<div/>').html(response).contents();
    return dom.find('a.block-link');
  }, callback);
}

function findElements(url, products, domParseCallback, callback) {
  loadUrl(url, function(response) {
    var elements = domParseCallback(response);
    parseElements(elements, products, callback);
  });
}

function parseElements(elements, products, callback) {
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
    if (current.name === product.name || current.url === product.url) {
      contains = true;
    }
  }

  if (!contains) {
    products.push(product);
  }
}
