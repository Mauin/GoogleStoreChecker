var notificationId = 0;

function showStartNotification() {
  showNotification("Checking the Google Store for you", "Refreshing the 6P site every " + timeout/1000 + " seconds");
}

function showUpdateNotification() {
  showNotification("Something has changed!", "The Nexus 6P might be available now!");
}

function showNotification(title, message) {
  var opt = {
   type: "basic",
   title: title,
   message: message,
   iconUrl: "icon.png"
  };
  var id = notificationId++;
  chrome.notifications.create(id.toString(), opt, function(id) {});
}
