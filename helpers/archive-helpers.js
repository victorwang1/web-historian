var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var http = require('http');
var httpHelper = require('../web/http-helpers');

exports.paths = {
  siteAssets: path.join(__dirname, '../web/public'),
  archivedSites: path.join(__dirname, '../archives/sites'),
  list: path.join(__dirname, '../archives/sites.txt')
};

// Used for stubbing paths for tests, do not modify
exports.initialize = function(pathsObj) {
  _.each(pathsObj, function(path, type) {
    exports.paths[type] = path;
  });
};


exports.readListOfUrls = function(callback) {
  fs.readFile(exports.paths.list, 'utf8', function(err, data) {
    if (!err) {
      callback(data);
    } else {
      console.log("cannot read url list");
    }
  });
};

exports.isUrlInList = function(url, callback) {
  exports.readListOfUrls(function(data) {
    var location = data.indexOf(url);
    var archived = data[data.indexOf('\r\n', location) - 1] === '*';
    if (location > -1) {
      callback(true, archived);
    } else callback(false);
  });
};

exports.addUrlToList = function(url) {
  var writeContent = url + '*' + '\r\n';
  fs.appendFile(exports.paths.list, writeContent, function(err) {
    if (!err) {
      console.log('write successful');
    } else {
      console.log('WRITE FAILED');
      console.log(err);
    }
  });
};

exports.archivedUrls = function(callback) {
  exports.readListOfUrls(function(data) {
    callback(data.split('\r\n')
                 .map((url) => url.trim())
                 .filter((url) => url.includes('*')));
  });
};

exports.writeFile = function(fileName, content) {
  var filePath = path.join(exports.paths.archivedSites, fileName);
  fs.writeFile(filePath, content, function(err) {
    if (err) console.log('cannot save webpage');
    else console.log('site saved successfully');
  })
};

exports.downloadUrls = function(urls) {
  urls.forEach((url) => {
    var options = {
      host: url,
      port: 80,
      path: '/index.html'
    };
    http.get(options, function(res) {
      console.log(res);
      exports.writeFile(url, res);
      console.log("Got response: " + res.statusCode);
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
    });
  });
};
