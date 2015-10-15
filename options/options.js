var productSubUrl = "/product/";
var products = "";
var minimumInterval = 10000;

document.addEventListener('DOMContentLoaded', function() {
  chrome.extension.sendMessage({
    products: true
  }, function(response) {
    selectedProductName = response.selected.name;

    products = response.products;
    products.sort(function(a, b) {
      return a.name.localeCompare(b.name);
    });
    generateForm(products, selectedProductName);
    setIntervalTextBox(response.interval / 1000);
  });
});

function save() {
  var selected = document.querySelector('input[name="product"]:checked').value;

  var selectedProduct = findNameInProducts(products, selected);
  var selectedInterval = document.getElementById('interval').value * 1000;

  if (selectedInterval < minimumInterval) {
    selectedInterval = minimumInterval;
  }

  chrome.extension.sendMessage({
    product: selectedProduct,
    interval: selectedInterval
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

function setIntervalTextBox(interval) {
  var textBox = document.getElementById('interval');
  textBox.value = interval;
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
