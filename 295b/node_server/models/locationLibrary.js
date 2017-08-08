var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//either the patientId or the caregiverId will be set. The android application will update this collection every few mins/seconds and update the location.

var locationLibSchema = new Schema({
  //locationId: {type: String, unique: true, required: true},
  patientId: Schema.ObjectId,
  caregiverId: Schema.ObjectId,
  latitude: String,
  longitude: String,
  locationDescription: String,
  locationName: String,
  time : { type : Date, default: Date.now }
});

var locationLibrary = mongoose.model('locationLibrary', locationLibSchema);

module.exports = locationLibrary;
