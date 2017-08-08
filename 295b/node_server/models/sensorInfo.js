var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sensorSchema = new Schema({
  patientId: Schema.ObjectId,		//Fetch daily summary data for each patient once a day https://dev.fitbit.com/docs/activity/  
  date: Date, //one entry daily for each patient
  summary: Schema.Types.Mixed
});

var sensorInfo = mongoose.model('sensorInfo', sensorSchema);

module.exports = sensorInfo;