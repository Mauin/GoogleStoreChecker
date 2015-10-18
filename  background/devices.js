function getDevices(callback) {
  var products = new Array();
  var remaining = 0;
  // Find categories (and products from the front page)
  findElements(storeUrl, products, function(response) {
    var dom = jQuery('<div/>').html(response).contents();
    return dom.find('a.block-link');

  }, function(products, categories) {
    remaining = categories.length;
    // Find products in every category
    for (var i = 0; i < categories.length; i++) {
      var categoryUrl = storeUrl + categories[i];
      findElements(categoryUrl, products, function(response) {
        var dom = jQuery('<div/>').html(response).contents();
        // Find all 'div's with 'data-available' parameters
        return dom.find('a.flag-button-hover-target');

      }, function(foundProducts, categories) {
        remaining--;
        if (remaining == 0) {
          syncProducts(foundProducts);
          callback(foundProducts);
        }
      });
    }
  });
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