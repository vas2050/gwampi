const mongoose  = require('mongoose');
const uniqValidator = require('mongoose-unique-validator');

// enroll schema
var enrollSchema = new mongoose.Schema({
  fname     : { type: String, index: true, required: true, trim: true },
  lname     : { type: String, index: true, required: true, trim: true },
  userid    : { type: String, unique: true, index: true, lowercase: true, required: true, trim: true },
  email     : { type: String, unique: true, lowercase: true, required: true, trim: true },
  appid     : { type: String, lowercase: true, trim: true },
  enrolled  : { type: Date, default: Date.now() },
  approved  : { type: String, enum: ['P', 'A', 'D'], default: 'P' },
  activated : { type: String, enum: ['P', 'A', 'D'], default: 'P' },
});

enrollSchema.plugin(uniqValidator);

module.exports = mongoose.model('Enrolls', enrollSchema);

module.exports.createEnroll = function(newEnroll, callback) {
  newEnroll.save(callback);
}
