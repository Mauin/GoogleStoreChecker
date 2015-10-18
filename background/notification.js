var notificationId = 0;

function notificationHandling(product, last, now) {
  // Nothing to do here
  if (last == now) {
    return;
  }

  if (now > last && last == 0) {
    showInStockNotification(product);
  } else if (now > last && last > 0) {
    showIncreaseNotification(product);
  } else if (now < last && now > 0) {
    showDecreaseNotification(product);
  } else if (now < last && now == 0) {
    showOutOfStockNotification(product);
  }
}

function showStartNotification(product) {
  showNotification("Looking for the " + product.name + " for you", "Checking for changes every " + refreshInterval/1000 + " seconds");
}

function showInStockNotification(product) {
  showNotification(product.name + " is in Stock!", "Click here to see the Google Store product page");
}

function showIncreaseNotification(product) {
  showNotification("More models of the " + product.name + " are in Stock!", "Click here to see the Google Store product page");
}

function showDecreaseNotification(product) {
  showNotification("Some models of the " + product.name + " have gone out of Stock!", "Click here to see the Google Store product page");
}

function showOutOfStockNotification(product) {
  showNotification("The " + product.name + " has gone out of Stock!", "Click here to see the Google Store product page");
}

function showNotification(title, message) {
  var opt = {
   type: "basic",
   title: title,
   message: message,
   iconUrl: "res/icon_128.png"
  };
  var id = notificationId++;
  chrome.notifications.create(id.toString(), opt, function(id) {});
}