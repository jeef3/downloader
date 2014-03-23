'use strict';

var Q = require('q');

module.exports = function (sftp) {
  return function (files) {
    var deferred = Q.defer();

    var unlinkDeferreds = [];

    files.forEach(function (file) {
      unlinkDeferreds
        .push(Q.nfcall(sftp.unlink, file.path + '/' + file.filename));
    });

    Q.all(unlinkDeferreds)
      .then(function () {
        deferred.resolve();
      });

    return deferred.promise;
  };
};
