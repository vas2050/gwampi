const date  = require('./date');

var user = "";

function logInfo(msg) {
  logThis(msg, 'info');
}

function logError(msg) {
  logThis(msg, 'error');
}

function logWarn(msg) {
  logThis(msg, 'warn');
}

function log(msg) {
  logThis(msg);
}

function logThis(msg, caller) {
  if (caller) {
    console.log('[' + date.myDateTime() + ']' + '[' + user + ']' + caller + ': ' + msg);
  }
  else {
    console.log('[' + date.myDateTime() + ']' + '[' + user + ']' + msg);
  }
}

module.exports = {
  logInfo : logInfo,
  logError: logError,
  logWarn : logWarn,
  log     : log,
};
