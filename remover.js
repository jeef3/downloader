'use strict';

var Q = require('q');

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

  return function (files) {
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
        console.log('Files deleted');
        deferred.resolve();
      }, function (err) {
        if (err) {
          throw err;
        }
      });

    return deferred.promise;
  };
};
