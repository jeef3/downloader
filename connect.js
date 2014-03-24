'use strict';

var Connection = require('ssh2');
var Q = require('q');

require('colors');

var config = require('./config');

module.exports = function () {
  var deferred = Q.defer();

  var connection = new Connection();
  connection.on('ready', function() {
    connection.sftp(function(err, sftp) {
      if (err) {
        throw err;
      }

      sftp.on('end', function() {
        console.log('SFTP session closed');
      });

      console.log('Connected'.green);
      deferred.resolve({ connection: connection, sftp: sftp });
    });
  });

  connection.on('error', function(err) {
    console.log('Connection dropped: %s'.red, err);
  });

  connection.on('end', function() {
    console.log('Connection ended');
  });

  connection.on('close', function(hadError) {
    if (hadError) {
      console.log('Connection closed due to an error'.red);
    } else {
      console.log('Connection closed');
    }
  });

  console.log('Connecting...');
  connection.connect({
    host: config.get('HOST'),
    port: config.get('PORT'),
    username: config.get('USERNAME'),
    password: config.get('PASSWORD'),
  });

  return deferred.promise;
};
