'use strict';

module.exports = function (c, sftp) {
  return function () {
    sftp.end();
    c.end();
  };
};
