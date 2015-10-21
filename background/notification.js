var notificationId = 0;

function notificationHandling(product, config, last, now) {
  // Nothing to do here
  if (last == now) {
    return;
  }

  var name = getProductName(product, config);

  if (now > last && last == 0) {
    showInStockNotification(name);
  } else if (now > last && last > 0) {
    showIncreaseNotification(name);
  } else if (now < last && now > 0) {
    showDecreaseNotification(name);
  } else if (now < last && now == 0) {
    showOutOfStockNotification(name);
  }
}

function showStartNotification(product, config) {
  var name = getProductName(product, config);
  showNotification("Looking for the " + name + " for you", "Checking for changes every " + refreshInterval/1000 + " seconds");
}

function showInStockNotification(name) {
  showNotification(name + " is in Stock!", "Click here to see the Google Store product page");
}

function showIncreaseNotification(name) {
  showNotification("More models of the " + name + " are in Stock!", "Click here to see the Google Store product page");
}

function showDecreaseNotification(name) {
  showNotification("Some models of the " + name + " have gone out of Stock!", "Click here to see the Google Store product page");
}

function showOutOfStockNotification(name) {
  showNotification("The " + name + " has gone out of Stock!", "Click here to see the Google Store product page");
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
