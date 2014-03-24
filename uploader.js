'use strict';

var path = require('path');
var fs = require('fs');
var Q = require('q');
var ProgressBar = require('progress');
var filesize = require('filesize');

require('colors');

var config = require('./config');

module.exports = function (sftp) {

  return function (files) {
    var deferred = Q.defer();

    var filename = files[0];
    var localFile = path.join(config.get('UPLOAD_FROM_DIR'), filename);
    var remoteFile = path.join(config.get('UPLOAD_DIR'), filename);

    var file = fs.statSync(localFile);

    console.log('Uploading %s, %s'.black, filename, filesize(file.size));
    var bar = new ProgressBar('Uploading: |:bar| :percent :etas', {
      complete: '▇',
      incomplete: ' ',
      width: 40,
      total: file.size
    });

    sftp.fastPut(
      localFile,
      remoteFile,
      {
        step: function (transferred, chunk, total) {
          bar.update(transferred / total);
        }
      },
      function (err) {
        if (err) {
          throw err;
        }

        console.log('Finished uploading to %s'.green, remoteFile);

        deferred.resolve(files);
      });

    return deferred.promise;
  };
};
