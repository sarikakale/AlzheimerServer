var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define the schema for our user model
var notificatonFrequency = new Schema({
	patientId: {type: Schema.Types.ObjectId, ref: "patient", unique: true},
    timestamp:  { type: Date, default: Date.now }
});


// create the model for users and expose it to our app
module.exports = mongoose.model('notificatonFrequency', notificatonFrequency);