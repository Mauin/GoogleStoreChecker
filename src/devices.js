function getDevices(callback) {
  setAndSyncTimeStamp();

  products = new Array();
  var categories = new Set();

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
        addProduct(createProduct(name, path));
      } else if (path.includes(categoryString)) {
        categories.add(path);
      }
    }

    var catArray = Array.from(categories);
    for (var i = 0; i < catArray.length; i++) {
      var categoryUrl = storeUrl + catArray[i];
      var finished = 0;
      loadUrl(categoryUrl, function(response) {
        // Parse DOM
        var dom = jQuery('<div/>').html(response).contents();
        // Find all 'div's with 'data-available' parameters
        var devices = dom.find('a.flag-button-hover-target');
        for (var j = 0; j < devices.length; j++) {
          var name = devices[j].dataset.title;
          var path = devices[j].pathname;
          if (path.includes(productString)) {
            addProduct(createProduct(name, path));
          }
        }

        finished++;

        if (finished == catArray.length) {
          chrome.storage.sync.set({
            products: products
          });
          callback();
        }

      });
    }
  });
}
