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
var receivePost = function(req, callback) {
  var data = '';
  req.on('data', function(chunk) {
    data += chunk;
  }).on('end', function() {
    // raw data looks like 'url=www.google.com'
    callback(data.split('=')[1]);
  });
};

exports.handleRequest = function (req, res) {
  var url;
  if (req.method === 'POST') {
    receivePost(req, function(requestedUrl) {
      if (!validateUrl(requestedUrl)) {
        httpHelper.sendResponse(res, 300, 'input url not valid');
      } else {
        archive.isUrlInList(requestedUrl, function(inList) {
          if (inList === true) {
            // if requestedUrl is in list
              // ask http-helper to serve request
            console.log('requested url is in list');
            var website = './' + requestedUrl;
            url = path.join(archive.paths.archivedSites, website);
            httpHelper.serveAssets(res, url, httpHelper.sendResponse);
          } else {
            // otherwise
              // serve loading page
            console.log('requested url NOT in list');
            url = path.join(archive.paths.siteAssets, './loading.html');
            httpHelper.serveAssets(res, url, httpHelper.sendResponse, 200);
            // add url to list
            archive.addUrlToList(requestedUrl);
          }
        })
      }
    });
  } else if (url = routes[req.url]) {
    httpHelper.serveAssets(res, url, httpHelper.sendResponse);
  } else {
    httpHelper.sendResponse(res, 404, '404 not found');
  }
};
