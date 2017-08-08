var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//entry for each combination of caregiver and patient

var geoFenceSchema = new Schema({
  caregiverId: Schema.ObjectId,		//caregiver will set radius for each patient he wants to monitor.
  patientId: Schema.ObjectId,
  location: {
  	latitude: String,
  	longitude: String
  },
  radius: Number,
  toggleFlag: {type: Boolean, default: true}
});

geoFenceSchema.index({ caregiverId: 1, patientId: 1}, { unique: true }); //combination of caregiverId and patientId unique

var geoFence = mongoose.model('geoFence', geoFenceSchema);

module.exports = geoFence;