var notificationId = 0;

function showStartNotification(product) {
  showNotification("Looking for the " + product + " for you", "Checking for changes every " + timeout/1000 + " seconds");
}

function showUpdateNotification(product) {
  showNotification(product + " availability has changed!", "Click here to see the Google Store product page");
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
