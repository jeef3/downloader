'use strict';

var path = require('path');
var fs = require('fs');
var Q = require('q');
var ProgressBar = require('progress');

var config = require('./config');

module.exports = function (sftp) {

  return function (files) {
    var deferred = Q.defer();

    var file = files[0];
    var remoteFile = file.path + '/' + file.filename;
    var localFile = path.join(config.get('TEMP_SAVE_DIR'), file.filename);
    var finalLocalFile = path.join(config.get('SAVE_DIR'), file.filename);

    console.log('Downloading %s'.black, file.filename);
    var bar = new ProgressBar('Downloading: [:bar] :percent :etas', {
      complete: '▇',
      incomplete: ' ',
      width: 40,
      total: file.attrs.size
    });

    sftp.fastGet(
      remoteFile,
      localFile,
      {
        step: function (transferred, chunk, total) {
          bar.update(transferred / total);
        }
      },
      function (err) {
        if (err) {
          throw err;
        }

        fs.renameSync(localFile, finalLocalFile);
        console.log('Finished downloading to %s', finalLocalFile);

        deferred.resolve(files);
      });

    return deferred.promise;
  };
};
