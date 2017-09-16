// Use the code in `archive-helpers.js` to actually download the urls
// that are waiting.
var fs = require('fs');
var archive = require('../helpers/archive-helpers');

var updateList = function() {
  var listPath = archive.paths.list;
  fs.readFile(listPath, function(err, data) {
    data = data.toString();
    fs.writeFile(listPath, data.replace(/\*/g, ''), function(err) {
      if (err) console.log('error replacing asterisks');
      else console.log('unmarking archived sites');
    })
  })
};

archive.archivedUrls(function(urls) {
  urls = urls.map((url) => url.replace(/\*/g, ''));
  archive.downloadUrls(urls);
  updateList();
});
