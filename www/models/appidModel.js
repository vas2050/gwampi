const mongoose  = require('mongoose');
const pad       = require('pad');
const uniqValidator = require('mongoose-unique-validator');

// appid schema
var appidSchema = new mongoose.Schema({
  appid   : { type: String, unique: true, index: true, lowercase: true, required: true, trim: true },
  name    : { type: String, unique: true, index: true, lowercase: true, required: true, trim: true },
  desc    : { type: String, index: true, trim: true },
  created : { type: Date, default: Date.now() },
});

appidSchema.plugin(uniqValidator);

module.exports = mongoose.model('Appids', appidSchema);

module.exports.findOrcreateOne = function(newAppid, callback) {
  this.findOne(newAppid.name, function(err, appObj) {
    if (appObj.appid) {
      callback(err, appObj);
    }
    else {
      newAppid.name = newAppid.name.trim().toLowerCase();
      newAppid.appid = newAppid.name + '_' + randomTens(4);
      newAppid.desc = 'App: ' + newAppid.name;
      newAppid.save(callback);
    }
  });
}

module.exports.findOneByName = function(name, callback) {
  var query = {name: name.toLowerCase()};
  this.findOne(query, callback);
}

function randomTens(d) {
  return pad(d, String(Math.floor(Math.random() * Math.pow(10, d))), '0')
}
