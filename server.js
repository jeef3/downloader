'use strict';

var connect = require('./connect');
var checker = require('./checker');
var select = require('./select');
var downloader = require('./downloader');
// var remove = require('./remove');

// TODO: Call pereodically
connect()
  .then(function (sftp) {
    var check = checker(sftp);
    var download = downloader(sftp);

    check()
      .then(select)
      .then(download);
      // .then(remove);
  });
