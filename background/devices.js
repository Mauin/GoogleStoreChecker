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
    findConfigurations(product, function() {
      remaining--;
      if (remaining == 0) {
        callback(products);
      }
    });
  }
}

function findConfigurations(product, callback) {
  loadUrl(product.url, function(dom) {

    // Find data
    var productName = parseProductName(dom);
    var configurations = parseModels(dom);

    // Set data to product
    product.name = productName;
    product.configurations = configurations;

    callback();
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
  findProductsAndCategories(categoryUrl, products, parseProductsFromCategoryPage, callback);
}

function findCategories(callback) {
  var products = new Array();

  // Find categories (and products from the front page)
  findProductsAndCategories(storeUrl, products, parseFrontPageItems, callback);
}

function findProductsAndCategories(url, products, domParseCallback, callback) {
  loadUrl(url, function(dom) {
    var elements = domParseCallback(dom);
    parseProductsAndCategories(elements, products, callback);
  });
}
