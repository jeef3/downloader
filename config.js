'use strict';

var nconf = require('nconf');
var dotenv = require('dotenv');
var nconf = require('nconf');

dotenv.load();
nconf
  .argv()
  .env();

module.exports = nconf;
