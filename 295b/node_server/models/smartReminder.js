var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var reminderSchema = new Schema({
  patientId: Schema.ObjectId,
  location: {
  	latitude: String,
  	longitude: String
  },
  message: String
});

var smartReminder = mongoose.model('smartReminder', reminderSchema);

module.exports = smartReminder;