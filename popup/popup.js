document.addEventListener('DOMContentLoaded', function() {

  chrome.extension.sendMessage({}, function(response) {
    console.log(response);
    showCheckboxes(response.products);
 });
});

function showCheckboxes(products) {
    var status = document.getElementById('status');

    for (var product in products) {
      var pair = products[product];
      var checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.name = pair;
      checkbox.value = pair;
      status.appendChild(checkbox);

      var label = document.createElement('label')
      label.htmlFor = pair;
      label.appendChild(document.createTextNode(pair));

      status.appendChild(label);
      status.appendChild(document.createElement("br"));
    }
}
