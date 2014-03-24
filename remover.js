'use strict';

var Q = require('q');

module.exports = function (sftp) {
  return function (files) {
    var deferred = Q.defer();

    var unlinkDeferreds = [];

    files.forEach(function (file) {
      var toRemove = file.path + '/' + file.filename;
      console.log('Deleting remote file:', toRemove);

      unlinkDeferreds
        .push(Q.nfcall(sftp.unlink, toRemove));
    });

    Q.all(unlinkDeferreds)
      .then(function () {
        deferred.resolve();
      }, function (err) {
        if (err) {
          throw err;
        }
      });

    return deferred.promise;
  };
};
