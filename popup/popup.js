var productSubUrl = "/product/";
var products = "";

document.addEventListener('DOMContentLoaded', function() {
  chrome.extension.sendMessage({products: true}, function(response) {
    products = response.products;
    generateForm(products);
  });
});

function save() {
  var selected = document.querySelector('input[name="product"]:checked').value;

  var selectedProduct = findInProducts(products, selected);
  console.log(selected);
  chrome.extension.sendMessage({
    product: selectedProduct
  }, function(response) {});
}

function findInProducts(products, selected) {
  for (var product in products) {
    var currentProduct = products[product];

    if (currentProduct.name === selected) {
      return currentProduct;
    }
  }
}
// TODO clear form first
function generateForm(products) {
  var box = document.getElementById('productBox');

  for (var product in products) {
    var currentProduct = products[product];

    var checkbox = document.createElement("input");
    checkbox.type = "radio";
    checkbox.name = "product";
    checkbox.value = currentProduct.name;
    box.appendChild(checkbox);

    var label = document.createElement('label')
    label.htmlFor = currentProduct.name;
    label.appendChild(document.createTextNode(currentProduct.name));

    box.appendChild(label);
    box.appendChild(document.createElement("br"));
  }
  document.getElementById("saveButton").addEventListener('click', save);
}
