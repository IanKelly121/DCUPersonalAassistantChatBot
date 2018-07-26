var zipFolder = require('zip-folder');
var path = require('path');
var fs = require('fs');
var request = require('request');

var rootFolder = path.resolve('.');
var zipPath = path.resolve(rootFolder, '../dcuchatbot.zip');
var kuduApi = 'https://dcuchatbot.scm.azurewebsites.net/api/zip/site/wwwroot';
var userName = '$dcuchatbot';
var password = 'hEvh57M7xDiBwu3mJTMkcmBBMj1MfCTYLZxEqAvDBEk3zbByY1M8RvCX4zgR';

function uploadZip(callback) {
  fs.createReadStream(zipPath).pipe(request.put(kuduApi, {
    auth: {
      username: userName,
      password: password,
      sendImmediately: true
    },
    headers: {
      "Content-Type": "applicaton/zip"
    }
  }))
  .on('response', function(resp){
    if (resp.statusCode >= 200 && resp.statusCode < 300) {
      fs.unlink(zipPath);
      callback(null);
    } else if (resp.statusCode >= 400) {
      callback(resp);
    }
  })
  .on('error', function(err) {
    callback(err)
  });
}

function publish(callback) {
  zipFolder(rootFolder, zipPath, function(err) {
    if (!err) {
      uploadZip(callback);
    } else {
      callback(err);
    }
  })
}

publish(function(err) {
  if (!err) {
    console.log('dcuchatbot publish');
  } else {
    console.error('failed to publish dcuchatbot', err);
  }
});