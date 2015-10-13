var productSubUrl = "/product";

document.addEventListener('DOMContentLoaded', function() {
  chrome.extension.sendMessage({}, function(response) {
    generateForm(response.products);
  });
});

function save() {
  var selected = document.querySelector('input[name="rate"]:checked').value;
  console.log(selected);
  chrome.extension.sendMessage({
    product: selected
  }, function(response) {});
}

function generateForm(products) {
  var box = document.getElementById('productBox');

  for (var product in products) {
    var productUrl = products[product];
    var name = productUrl.replace(productSubUrl, '');

    var checkbox = document.createElement("input");
    checkbox.type = "radio";
    checkbox.name = "product";
    checkbox.value = productUrl;
    box.appendChild(checkbox);

    var label = document.createElement('label')
    label.htmlFor = name;
    label.appendChild(document.createTextNode(name));

    box.appendChild(label);
    box.appendChild(document.createElement("br"));
  }
  document.getElementById("saveButton").addEventListener('click', save);
}
