var productSubUrl = "/product/";
var products = "";
var minimumInterval = 10000;

document.addEventListener('DOMContentLoaded', function() {
  chrome.extension.sendMessage({
    products: true
  }, function(response) {
    var selectedProductName;
    if (response.selected) {
      selectedProductName = response.selected.name;
    }

    var selectedConfig;
    if (response.config) {
      selectedConfig = response.config;
    }

    products = response.products;
    products.sort(function(a, b) {
      return a.name.localeCompare(b.name);
    });
    generateForm(products, selectedProductName, selectedConfig);
    setIntervalTextBox(response.interval / 1000);
  });
});

function save() {
  var selected = document.querySelector('input[name="product"]:checked').value;

  var selectedProduct = products[selected];
  var selectedInterval = document.getElementById('interval').value * 1000;

  var selectedSelect = document.querySelector("select[name=\"" + selected + "\"]");
  var config = selectedSelect.options[selectedSelect.selectedIndex].value;

  var selectedConfig;
  if (config >= 0) {
    selectedConfig = selectedProduct.configurations[config]
  }

  if (selectedInterval < minimumInterval) {
    selectedInterval = minimumInterval;
  }

  chrome.extension.sendMessage({
    product: selectedProduct,
    interval: selectedInterval,
    config: selectedConfig
  }, function(response) {});
}

function change() {
  var selected = document.querySelector('input[name="product"]:checked').value;
  var allSelects = document.querySelectorAll('select');
  for (var i = 0; i < allSelects.length; i++) {
    allSelects[i].style.display = "none";
  }

  var select = document.querySelector("select[name=\"" + selected + "\"]");

  console.log("change");
  select.style.display = "block";
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

function generateForm(products, selectedProductName, selectedConfig) {
  var selected = 0;
  var box = document.getElementById('productBox');

  for (var i = 0; i < products.length; i++) {
    var currentProduct = products[i];

    var checkbox = document.createElement("input");
    checkbox.type = "radio";
    checkbox.name = "product";
    checkbox.value = i;
    if (selectedProductName === currentProduct.name) {
      checkbox.checked = true;
      selected = 1;
    }
    box.appendChild(checkbox);

    // Append product name label
    var label = document.createElement('label');
    label.htmlFor = currentProduct.name;
    label.appendChild(document.createTextNode(currentProduct.name));

    box.appendChild(label);

    var selectedConfigString = "";
    if (selectedConfig !== undefined) {
      selectedConfigString = createConfigString(selectedConfig);
    }


    // Append Configuration Spinner
    if (currentProduct.configurations.length > 1) {
      var select = document.createElement('select');
      select.name = i;
      select.appendChild(createOption(-1, "Check for all"));

      for (var j = 0; j < currentProduct.configurations.length; j++) {
        var config = currentProduct.configurations[j];
        var configString = createConfigString(config);
        select.appendChild(createOption(j, configString));

        if (configString === selectedConfigString) {
          select.value = j;
        }
      }
      box.appendChild(select);

      select.style.display = 'none';
    }

    box.appendChild(document.createElement("br"));
  }
  document.getElementById("saveButton").addEventListener('click', save);
  document.getElementById("form").addEventListener('change', change);
  if (selected > 0) {
    change();
  }
}

function createOption(id, name) {
  var option = document.createElement('option');
  option.value = id;
  option.innerHTML = name;
  return option;
}

function createConfigString(config) {
  var string = "";

  for (var i = 0; i < config.data.length; i++) {
    string += config.data[i].name + " ";
  }
  return string;
}
