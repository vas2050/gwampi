const express  = require('express');
const bParser  = require('body-parser');
const cParser  = require('cookie-parser');
const session  = require('express-session');
const passport = require('passport');
const weather  = require('weather-js');
const flash    = require('flash-express');
const logger   = require('./src/lib/logger');
const grid     = require('./src/grid');
const server   = require('./src/server');
const db       = require('./src/lib/db');
const User     = require('./models/userModel');
const Enroll   = require('./models/enrollModel');
const code     = require('./src/code');
const common   = require('./src/lib/common');
const sleep    = require('sleep');
const sharedsession = require('express-socket.io-session');

const port = 8080;
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

var guestNum = 1111;
var clients = {};

io.on('connection', function(socket) {
  var session = socket.handshake.session;
  //OLD: no more we require to pass as query as we got app session shared with io now
  //OLD: var user = socket.handshake.query.user;
  var user;
  if (session['user']) {
    user = session['user']['userid'];
  }
  else {
    socket.disconnect();
    return;
  }
  clients[user] = socket;
  logger.logInfo("user " + user + " connected to channel");
  // reset the session expiry and communicate this to that particular client
  session.touch();
  socket.emit('reset_session', session.cookie.maxAge);

  // a new client is active, push the new list to the clients
  io.emit('active_users', Object.keys(clients));

  socket.on('disconnect', function() {
    logger.logInfo("user " + user + " disconnected from channel");
    delete clients[user];
    // a client has left, push the new list to rest of the active clients
    io.emit('active_users', Object.keys(clients));
  });

  socket.on('comm_channel', function(data) {
    io.emit('comm_channel', data.msg);
    // refresh the session of the sender
    var socket = clients[data.from];
    var session = socket.handshake.session;
    session.touch();
    socket.emit('reset_session', session.cookie.maxAge);
  });
});

//app.listen(port, () => logger.log("gwampi started on " + port));
http.listen(port, () => logger.log("gwampi started on " + port));

//body parser - middleware
app.use(bParser.json());
app.use(bParser.urlencoded({extended: false}));
app.use(cParser());

app.set('trust proxy', 'loopback');

//session
var sess = session({
  path: '/',
  name: 'gwampi_sid',
  secret: 'd0nttry2gu3ssM3',
  cookie: {maxAge:  6 * 60 * 1000},
  saveUninitialized: true,
  resave: false,
  //  duration: 2 * 60 * 1000,
  //  httpOnly: true,
  //  secure: true,
  ephemeral: true,
});

app.use(sess);
io.use(sharedsession(sess, {autoSave: true}));

app.use(function(req, res, next){
  logger.logInfo(req.method.toUpperCase() + ' ' + req.path);

  // add extra info to check at frontend if session changed
  req.session.changed = Date.now();

  var views = req.session.views;
  if (!views) {
    views = req.session.views = {};
  }

  var path = req.path;
  // initialize to 0 if undefined
  views[path] = views[path] || 0;

  // increment session view only if user logged in for all the url path
  // and pug template will take care of displaying only '/'
  if (req.session.user) {
    views[path]++;
  }

  if (!req.user) {
    res.locals.session = req.session;
  }
  next();
});

app.use(flash({locals: 'flash'}));

//passport init
app.use(passport.initialize());
app.use(passport.session());

app.use('/static', express.static('public'));

app.set('view engine', 'pug');
app.set('/views', 'views');

app.post('/signup', function(req, res) {
  var fname = common.upperFirst(req.body.fname);
  var lname = common.upperFirst(req.body.lname);

  var userid = req.body.userid.trim();
  var email = req.body.email.trim();
  var appid = req.body.appid.trim();

  User.searchUserByUserIdAndEmail(userid, email, function(err, usr) {
    if (err) {
      logger.logError(err);
      res.json({message: 'error'});
    }
    else if (usr && usr.email) {
      logger.logError('userid or email already exists');
      res.json({message: 'error'});
    }
    else {
      var newEnroll = new Enroll({
        fname  : fname,
        lname  : lname,
        email  : email,
        userid : userid,
        appid  : appid,
      });

      Enroll.createEnroll(newEnroll, function(err, enroll) {
        if (err) {
          logger.logError(err);
          res.json({message: 'error'});
        }
        else {
          logger.logInfo('enroll success');

          var rand = common.random(9);
          userid += '::' + rand;
          email += '::' + rand;

          var newUser = new User({
            fname  : fname,
            lname  : lname,
            email  : email,
            userid : userid,
            pass   : req.body.pass,
            appid  : appid,
          });

          User.createUser(newUser, function(err, usr) {
            if (err) {
              logger.logError(err);
              res.json({message: 'error'});
            }
            else {
              logger.logInfo('update ' + usr.userid + ' success');
              res.json({message: 'success'});
            }
          });
        }
      });
    }
  });
});

var LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(
  {
    usernameField: 'userid',
    passwordField: 'password'
  },
  function(uid, pass, callback) {
    User.getUserByUserIdOrEmail(uid, function(err, usr) {
      if (err) {
        logger.logError(err);
        return callback(err);
      }
      else if (!usr) {
        return callback(null, false);
      }
      else if (usr) {
        User.comparePasswords(pass, usr.pass, function(err, isMatch) {
          if (err) {
            logger.logError(err);
            return callback(err);
          }
          else if (isMatch) {
            return callback(null, usr);
          }
          else {
            return callback(null, false);
          }
        });
      }
    });
  }
));

passport.serializeUser(function(usr, done) {
  done(null, usr.userid);
});

passport.deserializeUser(function(id, done) {
  User.getUserByUserId(id, function(err, usr) {
    done(err, usr);
  });
});

app.get('/', function(req, res) {
  if (!req.user) {
    res.locals.session = req.session;
    if (req.query.session_expired) {
      res.locals.session_expired = req.query.session_expired;
    }
  }
  //sleep.msleep(500); // let session updated by /comm
  res.render('index');
});

// grid
app.use('/grid', grid);

app.use('/server', server, function(req, res) {
  res.sendStatus(403);
});

app.get('/signup', function(req, res) {
  res.render('signup');
});

// code
app.use('/code', code);

//login
app.get('/login', function(req, res) {
  res.render('login');
});

app.post('/login',
  passport.authenticate('local'), function(req, res) {
    if (req.user) {
      logger.logInfo("auth ok");
      req.session.user = req.user.toJSON({virtuals: true})
      res.json({message: 'success'});
      //res.redirect('/');
    }
    else if (!req.user) {
      logger.logError('auth not ok');
      res.json({message: 'invalid user or password!'});
    }
    else {
      logger.logError('auth not ok');
      res.json({message: 'invalid user or password!'});
    }
  }
);

//check availability of new userid and email
app.get('/check', function(req, res) {
  var email = req.query.email;
  var uid = req.query.userid;

  var message = {email: false, userid: false};
  User.searchUserByUserIdOrEmail(email, function(err, usr) {
    if (err) {
      res.json({message: 'error'});
    }
    else if (usr && usr.email) {
      message.email = true;
    }

    User.searchUserByUserIdOrEmail(uid, function(err, usr) {
      if (err) {
        res.json({message: 'error'});
      }
      else if (usr && usr.userid) {
        message.userid = true;
      }
      res.json({message});
    });
  });
});

//current login
app.get('/user', function(req, res) {
  res.send(req.user);
});

//logout
app.get('/logout', function(req, res) {
  var session_expired = req.query.session_expired;
  req.logout();
  req.session.destroy();

  var url = '/';
  if (session_expired) {
    url += '?session_expired=' + session_expired;
  }

  return res.redirect(url);
});

// weather api
app.get('/weather/:city/:dtype', function(req, res) {
  var query = {search: decodeURIComponent(req.params.city), degreeType: req.params.dtype};
  weather.find(query, function(err, w) {
    if (err) {
      res.send(err);
    }
    else {
      var w = w[0];
      res.json(w);
    }
  });
});

// communication channel
app.get('/comm', function(req, res) {
  logger.logInfo(req.method.toUpperCase() + ' ' + req.path);
  if (req.user) {
    // do not allow second connection for the same user
    if (req.user.userid in clients) {
      logger.logError("user " + req.user.userid + " already in the chat");
      res.json({'error': 'you are already in the chat!'});
    }
    else {
      res.render('comm');
    }
  }
  else {
    //res.locals.user = 'Guest' + guestNum++;
    //res.render('comm');
    logger.logError("session expired or not authorized!");
    res.json({'error': 'your session expired or not authorized!'});
  }
});

// update session data
app.post('/update/session', function(req, res) {
  logger.logInfo(req.method.toUpperCase() + ' ' + req.path);
  var key = req.body.key;
  var val = req.body.val;

  req.session[key] = val;
  res.locals.session = req.session;
  res.json({success: true, message: 'session updated'});
});

//end
