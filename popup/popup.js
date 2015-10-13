var productSubUrl = "/product/";
var products = "";

document.addEventListener('DOMContentLoaded', function() {
  chrome.extension.sendMessage({
    products: true
  }, function(response) {
    selectedProductName = response.selected.name;
    products = response.products;
    generateForm(products, selectedProductName);
  });
});

function save() {
  var selected = document.querySelector('input[name="product"]:checked').value;

  var selectedProduct = findNameInProducts(products, selected);
  chrome.extension.sendMessage({
    product: selectedProduct
  }, function(response) {});
}

function findNameInProducts(products, selected) {
  for (var product in products) {
    var currentProduct = products[product];

    if (currentProduct.name === selected) {
      return currentProduct;
    }
  }
}

function generateForm(products, selectedProductName) {
  var box = document.getElementById('productBox');

  for (var product in products) {
    var currentProduct = products[product];

    var checkbox = document.createElement("input");
    checkbox.type = "radio";
    checkbox.name = "product";
    checkbox.value = currentProduct.name;
    if (selectedProductName === currentProduct.name) {
      checkbox.checked = true;
    }
    box.appendChild(checkbox);

    var label = document.createElement('label')
    label.htmlFor = currentProduct.name;
    label.appendChild(document.createTextNode(currentProduct.name));

    box.appendChild(label);
    box.appendChild(document.createElement("br"));
  }
  document.getElementById("saveButton").addEventListener('click', save);
}
