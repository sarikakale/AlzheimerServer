var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const uuidV1 = require('uuid/v1');

// define the schema for our user model
var fitbituser = new Schema({
	patientId: {type: Schema.Types.ObjectId, ref: "patient"},
    fitbitId:  String,
    accessToken: String,
    refreshToken: String,
    linkToPatient: {type:String, default: uuidV1()}
});


// create the model for users and expose it to our app
module.exports = mongoose.model('fitbituser', fitbituser);