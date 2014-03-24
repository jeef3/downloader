'use strict';

var Q = require('q');
var inquirer = require('inquirer');

module.exports = function (files) {
  var deferred = Q.defer();

  inquirer.prompt([
    {
      type: 'checkbox',
      message: 'Select file to upload/download',
      name: 'files',
      choices: files.map(function (f) {
        return { name: f.filename, value: f };
      })
    }], function (answers) {
      deferred.resolve(answers.files);
    });

  return deferred.promise;
};
