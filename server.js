'use strict';

var shelljs = require('shelljs');
var inquirer = require('inquirer');

var connect = require('./connect');
var checker = require('./checker');
var select = require('./select');
var downloader = require('./downloader');
var uploader = require('./uploader');
var remover = require('./remover');
var closer = require('./closer');

// TODO: Call pereodically
connect()
  .then(function (options) {
    var check = checker(options.sftp);
    var download = downloader(options.sftp);
    var upload = uploader(options.sftp);
    var remove = remover(options.sftp);
    var closeConnection = closer(options.connection, options.sftp);

    inquirer.prompt([
      {
        type: 'list',
        message: 'Upload or download?',
        name: 'option',
        choices: [
          'Upload',
          'Download'
        ]
      }], function (answers) {
        if (answers.option === 'Upload') {
          check.local()
            .then(select)
            .then(upload)
            .then(remove.local)
            .then(closeConnection)
            .then(function () {
              shelljs.exit(0);
            });
        }

        if (answers.option === 'Download') {
          check.remote()
            .then(select)
            .then(download)
            .then(closeConnection)
            .then(function () {
              shelljs.exit(0);
            });
        }
      });
  });
