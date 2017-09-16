var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
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

exports.readListOfUrlsAsync = function() {
  return fs.readFileAsync(exports.paths.list, 'utf8')
           .then(function(dataString) {
             return dataString;
           })
           .catch(function(err) {
             console.log("cannot read url list");
             console.log(err);
           });
};

exports.isUrlInListAsync = function(url) {
  return exports.readListOfUrlsAsync()
                .then(function(dataString) {
                  var location = dataString.indexOf(url);
                  var archived = dataString[dataString.indexOf('\r\n', location) - 1] === '*';
                  return {inList: location > -1,
                          archived: archived};
                });
};

exports.addUrlToListAsync = function(url) {
  var writeContent = url + '*' + '\r\n';
  return fs.appendFileAsync(exports.paths.list, writeContent, 'utf8')
           .catch(function(err) {
             console.log('WRITE FAILED');
             console.log(err);
           });
};

exports.archivedUrlsAsync = function() {
  return exports.readListOfUrlsAsync()
                .then(function(dataString) {
                  return dataString.split('\r\n')
                                   .map((url) => url.trim())
                                   .filter((url) => url.includes('*'));
                });
};

exports.downloadUrl = function(url) {
  var options = {
    host: url,
    port: 80,
    path: '/'
  };
  var filename = url.split('.')[1] + '.html';
  var filePath = path.join(exports.paths.archivedSites, filename);
  var file = fs.createWriteStream(filePath);
  http.get(options, function(res) {
    res.on('data', function(data) {
      file.write(data);
    }).on('end', function() {
      file.end();
      console.log(url + ' downloaded!');
    })
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });
};

exports.downloadUrls = function(urls) {
  urls.forEach((url) => exports.downloadUrl(url.replace(/\*/g, '')));
};

exports.updateListAsync = function() {
  return exports.readListOfUrlsAsync()
                .then(function(dataString) {
                  return fs.writeFileAsync(exports.paths.list, dataString.replace(/\*/g, ''));
                })
                .catch(function(err) {
                  console.log('error replacing asterisks');
                  console.log(err);
                })
};
