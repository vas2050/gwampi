const mongoose  = require('mongoose');

var counterSchema = new mongoose.Schema({
  _id : {type: String, required: true},
  next: {type: Number, default: 1}        
});

module.exports = mongoose.model('Counters', counterSchema);

module.exports.increment = function(name, callback) {
  return this.findOneAndUpdate({_id: name}, {$inc: {next: 1}}, {new: true, upsert: true, select: {next: 1}}, callback);
};
