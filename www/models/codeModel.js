const mongoose  = require('mongoose');

// code schema
var codeSchema = new mongoose.Schema({
  email : { type: String, unique: true, lowercase: true, required: true, trim: true },
  code  : { type: String, required: true, trim: true },
});

module.exports = mongoose.model('Codes', codeSchema);

module.exports.genCode = function(newCode, callback) {
  this.findOne({'email': newCode.email}, function(err, code) {
    if (code) {
      callback(null, code);
    }
    else {
      newCode.save(callback);
    }
  });
}

module.exports.verifyCode = function(email, code, callback) {
  this.findOne({email: email, code: code}, {_id: 0, email: 1}, callback);
}

module.exports.deleteCode = function(email, callback) {
  this.deleteOne({email: email}, callback);
}
