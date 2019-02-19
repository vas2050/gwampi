const mongoose  = require('mongoose');
const bcrypt    = require('bcrypt');
//const validator = require('validator');
const uniqValidator = require('mongoose-unique-validator');

// user schema
var userSchema = new mongoose.Schema({
  fname   : { type: String, index: true, required: true, trim: true },
  lname   : { type: String, index: true, required: true, trim: true },
  userid  : { type: String, unique: true, index: true, lowercase: true, required: true, trim: true },
  pass    : { type: String, required: true },
  email   : { type: String, unique: true, lowercase: true, required: true, trim: true },
  appid   : { type: String, lowercase: true, trim: true },
  created : { type: Date, default: Date.now() },
});

userSchema.virtual('fullname').get(function() {
  return this.fname + ' ' + this.lname;
});

userSchema.plugin(uniqValidator);

module.exports = mongoose.model('Users', userSchema);

module.exports.createUser = function(newUser, callback) {
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newUser.pass, salt, function(err, hash) {
      newUser.pass = hash;
      newUser.save(callback);
    });
  });
};

module.exports.getUserByUserId = function(uid, callback) {
  var query = {userid: uid};
  this.findOne(query, callback);
};

module.exports.getUserByUserIdOrEmail = function(uid, callback) {
  var query = {userid: uid};
  if (uid.match(/^\w+\@\w+\.\w+$/)) query = {email: uid};
  this.findOne(query, callback);
};

module.exports.searchUserByUserIdOrEmail = function(uid, callback) {
  var query = {userid: {'$regex': '^' + uid + '(::\\d+)?$'}};
  if (uid.match(/^\w+\@\w+\.\w+$/)) {
    query = {email: {'$regex': '^' + uid + '(::\\d+)?$'}};
  }
  this.findOne(query, callback);
};

module.exports.searchUserByUserIdAndEmail = function(uid, email, callback) {
  var query = {'$or': [ {userid: {'$regex': '^' + uid + '(::\\d+)?$'}}, {email: {'$regex': '^' + email + '(::\\d+)?$'}} ]};
  this.findOne(query, callback);
};

module.exports.getUserById = function(id, callback) {
  this.findById(id, callback);
};

module.exports.comparePasswords = function(pass, hash, callback) {
  bcrypt.compare(pass, hash, function(err, isMatch) {
    if (err) throw err;
    callback(null, isMatch);
  })
};
