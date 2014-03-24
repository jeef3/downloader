'use strict';

var Q = require('q');

var config = require('./config');

module.exports = function (sftp) {

  var closeHandle = function (handle) {
    sftp.close(handle, function(err) {
      if (err) {
        throw err;
      }
    });
  };

  var readFiles = function (path, files) {
    var readFilesDeferred = Q.defer();

    var fileList = [];
    var readDirPromises = [];

    files.forEach(function (file) {
      if (file.filename === '.' || file.filename === '..') {
        return;
      }

      if (file.longname.indexOf('d') === 0) {
        readDirPromises.push(readDir(path + '/' + file.filename));
      }

      // Only look for video files
      if (/mkv|mp4|txt/.test(file.filename)) {
        file.path = path;
        fileList.push(file);
      }
    });

    Q.all(readDirPromises)
      .then(function (dirResults) {
        dirResults.forEach(function (f) {
          fileList = fileList.concat(f);
        });

        readFilesDeferred.resolve(fileList);
      });

    return readFilesDeferred.promise;
  };

  var readDir = function (path) {
    var readDirDeferred = Q.defer();

    sftp.opendir(path, function (err, handle) {
      if (err) {
        readDirDeferred.reject(err);
      }

      var readFilesPromises = [];

      var readDir = function (err, files) {
        if (err) {
          readDirDeferred.reject(err);
        }

        if (files) {
          readFilesPromises.push(readFiles(path, files));

          // Next buffer
          sftp.readdir(handle, readDir);
        } else {
          closeHandle(handle);

          Q.all(readFilesPromises)
            .then(function (readFiles) {
              var fileList = [];
              readFiles.forEach(function (f) {
                fileList = fileList.concat(f);
              });
              readDirDeferred.resolve(fileList);
            });
        }
      };

      sftp.readdir(handle, readDir);
    });

    return readDirDeferred.promise;
  };

  return function () {
    var deferred = Q.defer();

    console.log('Checking for new files...');

    readDir(config.get('HOME_DIR'))
      .then(function (files) {
        console.log('Found %d new files to download', files.length);
        deferred.resolve(files);
      });

    return deferred.promise;
  };
};
