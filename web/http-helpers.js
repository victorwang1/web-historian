var path = require('path');
var fs = require('fs');
var archive = require('../helpers/archive-helpers');

exports.headers = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10, // Seconds.
  'Content-Type': 'text/html'
};

exports.serveAssets = function(res, asset, callback = exports.sendResponse, statusCode = 200) {
  // Write some code here that helps serve up your static files!
  // (Static files are things like html (yours or archived from others...),
  // css, or anything that doesn't change often.)
  console.log(asset);
  fs.readFile(asset, 'utf8', function(err, data) {
    if (!err) {
      callback(res, statusCode, data);
    } else {
      console.log("cannot read file");
    }
  });
};

exports.sendResponse = function(res, statusCode, data) {
  // console.log(data);
  res.writeHead(statusCode, exports.headers);
  res.end(data);
}



// As you progress, keep thinking about what helper functions you can put here!
