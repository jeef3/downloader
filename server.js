'use strict';

var connect = require('./connect');
var checker = require('./checker');
var select = require('./select');
var downloader = require('./downloader');
var remover = require('./remover');

// TODO: Call pereodically
connect()
  .then(function (sftp) {
    var check = checker(sftp);
    var download = downloader(sftp);
    var remove = remover(sftp);

    check()
      .then(select)
      .then(download)
      .then(remove);
  });
