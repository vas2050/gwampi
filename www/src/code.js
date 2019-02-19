const express = require('express');
const logger  = require('./lib/logger');
const Code    = require('../models/codeModel');
const common  = require('./lib/common');

const router = express.Router();

router.use(function(req, res, next) {
  logger.logInfo(req.method.toUpperCase() + ' ' + req.path);
  next();
});

router.get('/gen', function(req, res) {
  var email = req.query.email;
  var fname = req.query.fname;
  var code = common.random(8);

  fname = common.upperFirst(fname);

  var newCode = new Code({
    email: email,
    code: code,
  });

  Code.genCode(newCode, function(err, code) {
    if (err) {
      res.json({message: 'error'});
    }
    else {
      var msg = ''
              + '<p>Hello ' + fname + ',<br/>'
              + '<br/>'
              + 'Your verification code: <b>' + code.code + '</b><br/>'
              + '<hr/>'
              + '<i>Admin</i><br/>'
              + '</p>';

      common.mailCode(code.email, msg, function(err, reply) {
        if (err) {
          logger.logError(code.email + ': ' + err.code);
        }
        else {
          logger.logInfo(reply.response);
          logger.logInfo(code.email + ': success');
        }
        // either case send back success response
        // let them verify :)
        res.json({message: 'success'});
      });
    }
  });
  res.json({message: 'success'});
});

router.get('/verify', function(req, res) {
  var email = req.query.email;
  var vcode = req.query.code;

  Code.verifyCode(email, vcode, function(err, code) {
    if (err) {
      logger.logError(err);
      res.json({message: 'error'});
    }
    else {
      if (code && code.email) {
        logger.logInfo('verified ' + code.email);
        Code.deleteCode(email, function(err, out) {
          if (err) {
            logger.logError('delete error');
          }
          else {
            logger.logInfo('deleted ' + code.email);
          }
        });
        res.json({message: 'success'});
      }
      else {
        logger.logInfo('verified: ' + code);
        res.json({message: 'error'});
      }
    }
  });
});

module.exports = router;
