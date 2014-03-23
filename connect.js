'use strict';

var Connection = require('ssh2');
var Q = require('q');

require('colors');

var config = require('./config');

module.exports = function () {
  var deferred = Q.defer();

  var c = new Connection();
  c.on('ready', function() {
    c.sftp(function(err, sftp) {
      if (err) {
        throw err;
      }

      sftp.on('end', function() {
        console.log('SFTP :: SFTP session closed');
      });

      console.log('Connected'.green);
      deferred.resolve(sftp);
    });
  });

  c.on('error', function(err) {
    console.log('Connection :: error :: ' + err);
  });

  c.on('end', function() {
    console.log('Connection :: end');
  });

  c.on('close', function(hadError) {
    if (hadError) {
      console.log('Connection :: error close');
    } else {
      console.log('Connection :: close');
    }
  });

  console.log('Connecting...');
  c.connect({
    host: config.get('HOST'),
    port: config.get('PORT'),
    username: config.get('USERNAME'),
    password: config.get('PASSWORD'),
  });

  return deferred.promise;
};
