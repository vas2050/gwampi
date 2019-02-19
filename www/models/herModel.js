const mongoose  = require('mongoose');
const uniqValidator = require('mongoose-unique-validator');

// HER schema
var herSchema = new mongoose.Schema({
  cid       : { type: Number, required: true, unique: true },
  category  : { type: String, required: true, trim: true },
  amount    : { type: String, required: true },
  addedBy   : { type: String, required: true, lowercase: true, trim: true },
  updatedBy : { type: String, lowercase: true, trim: true },
  bdate     : { type: Date, required: true },
  adate     : { type: Date, required: true, default: Date.now() },
  udate     : { type: Date },
});

herSchema.plugin(uniqValidator);

module.exports = function (app) {
  var model = mongoose.model(app, herSchema);

  model.findAll = function(callback) {
    // this.find({}, {cid:1, category:1, amount: 1, addedBy: 1, bdate: 1, adate: 1, udate: 1, _id: 0}, callback);
    this.find({}, callback);
  }

  model.insertOne = function(newHer, callback) {
    newHer.save(callback);
  }

  model.findByIdAndRemove = function(cid, callback) {
    this.findOneAndDelete({cid: cid}, callback);
  }

  model.findAndModify = function(cid, obj, callback) {
    this.findOneAndUpdate({cid: cid}, {$set: obj}, {new: true}, callback);
  }

  return model;
}
