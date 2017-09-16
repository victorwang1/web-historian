var path = require('path');
var archive = require('../helpers/archive-helpers');
var httpHelper = require('./http-helpers');


// routing static html on base site
var routes = {
  '/': path.join(archive.paths.siteAssets, './index.html'),
  '/styles.css': path.join(archive.paths.siteAssets, './styles.css'),
  '/favicon.ico': path.join(archive.paths.siteAssets, './favicon.ico')
};

var validateUrl = function(url) {
  var res = url.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
  if (res === null) return false;
  else return url;
};

// requests
var receivePostAsync = function(req, callback) {
  var data = '';
  return new Promise(function(resolve) {
    req.on('data', function(chunk) {
      data += chunk;
    }).on('end', function() {
      resolve(data.split('=')[1]); // raw data looks like 'url=www.google.com'
    });
  })
};

exports.handleRequest = function (req, res) {
  var url;
  if (req.method === 'POST') {
    receivePostAsync(req).then(function(requestedUrl) {
      if (!validateUrl(requestedUrl)) {
        httpHelper.sendResponse(res, 300, 'input url not valid');
      } else {
        archive.isUrlInListAsync(requestedUrl)
        .then(function({inList, archived}) {
          if (inList && !archived) {
            console.log('requested url is in list');
            var website = './' + requestedUrl.split('.')[1] + '.html';
            url = path.join(archive.paths.archivedSites, website);
          } else {
            if (!archived) archive.addUrlToListAsync(requestedUrl);
            console.log('requested url NOT in list or has not been archived');
            url = path.join(archive.paths.siteAssets, './loading.html');
          }
          httpHelper.serveAssets(res, url);
        });
      }
    });
  } else if (url = routes[req.url]) {
    httpHelper.serveAssets(res, url);
  } else {
    httpHelper.sendResponse(res, 404, 'Request not valid');
  }
};
