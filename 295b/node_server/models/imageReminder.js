var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var reminderSchema = new Schema({
  friendId: String, //point to s3 key //can be a caregiver or a random person
  patientId: {type: Schema.Types.ObjectId, ref: "patient"},
  name: String,
  message: String
});

var imageReminder = mongoose.model('imageReminder', reminderSchema);

module.exports = imageReminder;