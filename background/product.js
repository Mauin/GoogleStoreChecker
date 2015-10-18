/**
 * Defines a Product of the Google Store
 */
function Product() {
  this.name = "";
  this.productUrl = "";
  this.url = "";
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
