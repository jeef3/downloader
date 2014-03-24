'use strict';

var Q = require('q');
var inquirer = require('inquirer');

module.exports = function (files) {
  var deferred = Q.defer();

  inquirer.prompt([
    {
      type: 'list',
      message: 'Select file to upload/download',
      name: 'file',
      choices: files.map(function (f) {
        return { name: f.filename, value: f };
      })
    }], function (answers) {
      deferred.resolve([answers.file]);
    });

  return deferred.promise;
};
