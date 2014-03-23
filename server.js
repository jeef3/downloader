'use strict';

var Connection = require('ssh2');
var Table = require('cli-table');
var path = require('path');
var q = require('q');
var moment = require('moment');
var filesize = require('filesize');
var ProgressBar = require('progress');
var dotenv = require('dotenv');
var nconf = require('nconf');

require('colors');

dotenv.load();
nconf
  .argv()
  .env();

var table = new Table({
  head: ['File', 'Size', 'Last Modified'],
  chars: {'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': ''}
});

var c = new Connection();
c.on('ready', function() {
  console.log('Connected'.green);

  c.sftp(function(err, sftp) {
    if (err) {
      throw err;
    }

    sftp.on('end', function() {
      console.log('SFTP :: SFTP session closed');
    });

    var closeHandle = function (handle) {
      sftp.close(handle, function(err) {
        if (err) {
          throw err;
        }
      });
    };

    var readFiles = function (path, files) {
      var deferred = q.defer();

      var fileList = [];
      var dirPromises = [];

      files.forEach(function (file) {
        if (file.filename === '.' || file.filename === '..') {
          return;
        }

        if (file.longname.indexOf('d') === 0) {
          dirPromises.push(readDirectory(path + '/' + file.filename));
        }

        // Only look for video files
        if (/mkv|mp4/.test(file.filename)) {
          file.path = path;
          fileList.push(file);
        }
      });

      q.all(dirPromises)
        .then(function (dirResults) {
          dirResults.forEach(function (f) {
            fileList = fileList.concat(f);
          });

          deferred.resolve(fileList);
        });

      return deferred.promise;
    };

    var readDirectory = function (path) {
      var deferred = q.defer();

      sftp.opendir(path, function (err, handle) {
        if (err) {
          deferred.reject(err);
        }

        var readFilesPromises = [];

        var readDir = function (err, files) {
          if (err) {
            deferred.reject(err);
          }

          if (files) {
            readFilesPromises.push(readFiles(path, files));

            // Next buffer
            sftp.readdir(handle, readDir);
          } else {
            closeHandle(handle);

            q.all(readFilesPromises)
              .then(function (readFiles) {

                var fileList = [];
                readFiles.forEach(function (f) {
                  fileList = fileList.concat(f);
                });
                deferred.resolve(fileList);
              });
          }
        };

        sftp.readdir(handle, readDir);
      });

      return deferred.promise;
    };

    readDirectory(nconf.get('HOME_DIR'))
      .then(function (files) {
        console.log('Building table for %d files', files.length);

        files.forEach(function (file) {
          table.push([
            file.filename,
            filesize(file.attrs.size || 0),
            moment(file.attrs.atime * 1000).fromNow()
          ]);
        });

        console.log(table.toString());

        var toDownload = files[files.length - 1];
        var dl = toDownload.path + '/' + toDownload.filename;

        console.log('Downloading %s', toDownload.filename);
        var bar = new ProgressBar('Downloading: [:bar] :percent :etas', {
          complete: '▇',
          incomplete: ' ',
          width: 40,
          total: toDownload.attrs.size
        });

        sftp.fastGet(
          dl,
          path.join(nconf.get('SAVE_DIR'), toDownload.filename),
          {
            step: function (transferred, chunk, total) {
              bar.update(transferred / total);
            }
          },
          function (err) {
            if (err) {
              throw err;
            }
            console.log('Finished downloading %s', dl);

            sftp.end();
            c.end();
          });
      });
  });
});

c.on('error', function(err) {
  console.log('Connection :: error :: ' + err);
});
c.on('end', function() {
  console.log('Connection :: end');
});
c.on('close', function(hadError) {
  console.log('Connection :: close');
});

console.log('Connecting...');
c.connect({
  host: nconf.get('HOST'),
  port: nconf.get('PORT'),
  username: nconf.get('USERNAME'),
  password: nconf.get('PASSWORD'),
});
