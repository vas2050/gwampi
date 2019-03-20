const express = require('express');
const fs      = require('fs');
const logger  = require('./lib/logger');
const dt      = require('./lib/date');
//const db      = require('./lib/db');
const Counter = require('../models/counterModel');
const Appid   = require('../models/appidModel');
const sleep   = require('sleep');
const mongoose = require('mongoose');

const router = express.Router();

var Her;
router.use(function(req, res, next) {
  if (req.user && req.user.appid) {
    Appid.findOneByName(req.user.appid, function(err, appObj) {
      if (err) {
        logger.logError("findOneByName() failed");
        res.json({error: "Sorry, encountered some issue!"});
      }
      else {
        logger.logInfo("appid db for " + req.user.appid + ": " + appObj['appid']);
        var app = appObj['appid'] + '_her';
        Her = require('../models/herModel')(app);
        next();
      }
    });
  }
  else {
    logger.logError("no appid found for " + req.user.userid);
    res.json({error: "Sorry, you have no business with H.E.S!"});
  }
});

router.get('/', function(req, res) {
  logger.logInfo(req.method.toUpperCase() + ' ' + req.path);
 
  //sleep.msleep(500); // let session updated by /comm
  res.render('grid', function(err, script) {
    if (err) {
      res.sendStatus(500);
    }
    else {
      res.send(script);
    }
  });

  /* OR
  fs.readFile('./src/grid_index.js', function(err, html) {
    if (err) throw err;
    res.send(html);
    res.status(200).end();
  });
  */

  // OR
  // res.sendFile('grid_index.js', {root: __dirname});
});

router.get('/her', function(req, res) {
  logger.logInfo(req.method.toUpperCase() + ' ' + req.path);

  Her.findAll(function(err, her) {
    if (err) {
      logger.logError(err);
      res.status(500).send({success: false, message: 'findAll failed'});
    }

    res.json(her);
  });
});

router.post('/her', function(req, res) {
  var appid = req.user.appid + '_cid';
  Counter.increment(appid, function(err, counter) {
    if (err) {
      console.err('counter error: ' + err);
      res.status(500).end();
    }

    var cid = counter.next;
    if (!cid) {
      res.send(500).json({success: false, message: 'no CID provided'});
    }
 
    var newHer = new Her({
      cid      : cid,
      category : req.body.category,
      amount   : req.body.amount,
      bdate    : req.body.bdate,
      adate    : req.body.adate,
      addedBy  : req.user.userid,
    });

    Her.insertOne(newHer, function(err, her, count) {
      if (err) {
        console.log("error", err);
        res.status(500).json({success: false, message: 'not saved'});
      }
      else {
        //console.log("out", her, count)
        res.status(200).json({record: her, message: 'added'});
      }
    });
  });
});

router.delete('/her/:recid/:cid', function(req, res) {
  Her.findByIdAndRemove(req.params.cid, (err, her) => {
    if (err) {
      res.json({success: false, message: err});
    }

    res.json({recid: req.params.recid, cid: her.cid, message: 'deleted'});
  });
});

router.put('/her', function(req, res) {
  var cid = req.body.cid;
  var obj = {
    category  : req.body.category,
    amount    : req.body.amount,
    udate     : req.body.udate,
    updatedBy : req.user.userid,
  }

  Her.findAndModify(cid, obj, (err, her) => {
    if (err) {
      res.json({success: false, message: err});
    }
    else {
      res.json({record: her, message: 'updated'});
    }
  });
});

module.exports = router;
