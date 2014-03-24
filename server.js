'use strict';

var connect = require('./connect');
var checker = require('./checker');
var select = require('./select');
var downloader = require('./downloader');
var remover = require('./remover');
var closer = require('./closer');

// TODO: Call pereodically
connect()
  .then(function (options) {
    var check = checker(options.sftp);
    var download = downloader(options.sftp);
    var remove = remover(options.sftp);
    var closeConnection = closer(options.connection, options.sftp);

    check()
      .then(select)
      .then(download)
      .then(remove)
      .then(closeConnection);
  });
