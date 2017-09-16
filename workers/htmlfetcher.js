// Use the code in `archive-helpers.js` to actually download the urls
// that are waiting.
var archive = require('../helpers/archive-helpers');

archive.archivedUrlsAsync()
       .then(function(urls) {
         archive.downloadUrls(urls);
         archive.updateListAsync();
       });
