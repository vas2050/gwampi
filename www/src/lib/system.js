const logger = require('./logger');
const exec   = require('child_process').exec;
const sleep  = require('sleep'); 

function execute(cmd_array, delay) {
  var cmd = cmd_array.join(' ');
  if (delay) {
    cmd += "; sleep 3";
  }
  logger.logInfo("exec - " + cmd);

  var child = exec(cmd, function(error, stdout, stderr) {
    //logger.logInfo("stdout: " + stdout);
    if (stderr !== null) {
      logger.logError("500 ERROR");
      logger.logError("stderr: " + stderr);
      return 500;
    }

    if (error !== null) {
      logger.logError("501 ERROR");
      logger.logError('error: ' + error);
      return 501;
    }

    logger.logError("200 OK");
    return 200;
  });
}

module.exports = {
  execute: execute
};
