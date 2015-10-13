var timeout = 30000;
var colorGreen = "#00C400";
var colorRed = "#F20000";

var storeUrl = "https://store.google.com"

var categoryString = "category";
var productString = "product"

var products = new Set();
var categories = new Set();

var targetProduct = "";

var intervalLoop = false;

function Product() {
  this.name = "";
  this.productUrl = "";
  this.url = "";
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    if (request.products) {
      // List of Products requested
      sendResponse({
        products: Array.from(products),
        selected: targetProduct
      });
    } else if (request.product) {
      // Product selection broadcast
      targetProduct = request.product;
      console.log(targetProduct);
      restartLoop();
    }
  }
);

chrome.notifications.onClicked.addListener(function(id) {
  openStorePageTab();
});

function openStorePageTab() {
  var createProperties = {
    url: targetUrl
  }
  chrome.tabs.create(createProperties, function(tab) {});
}

function refreshContent() {
  console.log("refresh");
  console.log(targetProduct);
  loadUrl(targetProduct.url, function(response) {
    processResponse(targetProduct, response, setBadge);
  });
}

function setBadge(count) {
  if (count > 0) {
    chrome.browserAction.setBadgeText({
      text: count.toString()
    });
    chrome.browserAction.setBadgeBackgroundColor({
      color: colorGreen
    });
  } else {
    chrome.browserAction.setBadgeText({
      text: ":("
    });
    chrome.browserAction.setBadgeBackgroundColor({
      color: colorRed
    });
  }
}

// TODO refactor and extract
function getDevices() {
  loadUrl(storeUrl, function(response) {
    // Parse DOM
    var dom = jQuery('<div/>').html(response).contents();
    var domCategories = dom.find('a.block-link');

    for (var i = 0; i < domCategories.length; i++) {
      var path = domCategories[i].pathname;
      if (path === undefined) {
        break;
      }

      if (path.includes(productString)) {
        var name = domCategories[i].dataset.title;
        products.add(createProduct(name, path));
      } else if (path.includes(categoryString)) {
        categories.add(path);
      }
    }
    var catArray = Array.from(categories);
    for (var i = 0; i < catArray.length; i++) {
      var categoryUrl = storeUrl + catArray[i];

      loadUrl(categoryUrl, function(response) {
        // Parse DOM
        var dom = jQuery('<div/>').html(response).contents();
        // Find all 'div's with 'data-available' parameters
        var devices = dom.find('a.flag-button-hover-target');
        for (var j = 0; j < devices.length; j++) {
          var name = devices[j].dataset.title;
          var path = devices[j].pathname;
          if (path.includes(productString)) {
            products.add(createProduct(name, path));
          }
        }
      });
    }
  });
}

function createProduct(name, path) {
  var product = new Product();
  product.name = name;
  product.productUrl = path;
  product.url = storeUrl + path;
  return product;
}

// Background loop
function loop(delay) {
  intervalLoop = setInterval(refreshContent, delay);
}

function restartLoop() {
  if (intervalLoop) {
    clearInterval(intervalLoop);
    intervalLoop = false;
    resetCache();
  }

  refreshContent();
  loop(timeout);

  showStartNotification(targetProduct);
}

getDevices();
targetProduct = createProduct("Nexus 6P", "/product/nexus_6p");
restartLoop();
