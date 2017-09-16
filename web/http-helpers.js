var Promise = require('bluebird');
var path = require('path');
var fs = Promise.promisifyAll(require('fs'));
var archive = require('../helpers/archive-helpers');

exports.headers = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10, // Seconds.
  'Content-Type': 'text/html'
};

exports.sendResponse = function(res, statusCode, data) {
  return new Promise(function(resolve) {
    res.writeHead(statusCode, exports.headers);
    res.end(data);
    return data;
  })
}

exports.serveAssets = function(res, asset, statusCode = 200) {
  return fs.readFileAsync(asset, 'utf8')
    .then(function(data) {
      console.log('serving:' + asset);
      return data;
    })
    .then(function(data) {
      return exports.sendResponse(res, statusCode, data);
    })
    .catch(function(err) {
      console.log('error serving asset');
      console.log(err);
    });
};
