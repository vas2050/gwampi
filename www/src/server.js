const express = require('express');
const system  = require('./lib/system');
const logger  = require('./lib/logger');

var router = express.Router();
var command = 'bin/server.sh';
var header = [ 'content-type', 'text/html' ];

//middleware
router.use(function loggedIn(req, res, next) {
  if (req.user && req.user === 'admin') {
    logger.logInfo("user " + req.user.userid + " now authorized");
    next();
  }
  else {
    logger.logError("Sorry, you are not authorized!");
    res.redirect('/login');
  }
});

//home
router.get('/', function(req, res) {
  logger.logInfo(req.method.toUpperCase() + ' ' + req.path);
  res.render('server', function(err, html) {
    res.send(html);
  });
});

router.get('/stop', function(req, res) {
  res.setHeader(header[0], header[1]);
  res.send('<p style="font-family:Courier New;">Hello, I\'m going down \:\( Good Bye!<p><br/>');
  if (system.execute([command, 'stop']) != 200) {
    res.status(500).end('<p style="color:red;font-family:Courier New;">Hello, something went wrong \:\(<p><br/>');
  }
  else { // may not work if server is already down
    res.sendStatus(200).end();
  }
});

router.get('/restart', function(req, res) {
  res.setHeader(header[0], header[1]);
  res.send('<p style="font-family:Courier New;">Hello, I\'m going to bounce, see you soon \:\)</p><br/>');
  if (system.execute([command, 'restart'], true) != 200) {
    res.status(500).end('<p style="color:red;font-family:Courier New;">Hello, something went wrong \:\(<p><br/>');
  }
  else { // may not work if server is already down
    res.sendStatus(200).end();
  }
});

module.exports = router;
