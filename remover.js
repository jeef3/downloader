'use strict';

var fs = require('fs');
var path = require('path');
var Q = require('q');

var config = require('./config');

module.exports = function (sftp) {
  var deleteFile = function (file) {
    var deferred = Q.defer();

    sftp.unlink(file, function (err) {
      if (err) {
        throw err;
      }

      deferred.resolve();
    });

    return deferred.promise;
  };

  return {
    remote: function (files) {
      var deferred = Q.defer();

      var unlinkDeferreds = [];

      files.forEach(function (file) {
        var toRemove = file.path + '/' + file.filename;
        console.log('Deleting remote file:', toRemove);

        unlinkDeferreds
          .push(deleteFile(toRemove));
      });

      Q.all(unlinkDeferreds)
        .then(function () {
          console.log('Remote files deleted'.black);
          deferred.resolve();
        }, function (err) {
          if (err) {
            throw err;
          }
        });

      return deferred.promise;
    },
    local: function (files) {
      var deferred = Q.defer();

      files.forEach(function (file) {
        var toRemove = path.join(config.get('UPLOAD_FROM_DIR'), file);
        console.log('Deleting local file:', toRemove);

        fs.unlinkSync(toRemove);
      });

      console.log('Local files deleted'.black);
      deferred.resolve(files);

      return deferred.promise;
    }
  };
};
