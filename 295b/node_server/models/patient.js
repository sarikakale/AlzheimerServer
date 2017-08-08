
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var patientSchema = new Schema({
	userId: {type: Schema.ObjectId, unique: true},	//objectId of user document
	circleId: [{type: Schema.Types.ObjectId, ref: "circle"}],			//multiple circles can be present. array of object id's
	detailId: {type: Schema.ObjectId, ref: "contactDetails"},
	//locationId: Schema.ObjectId,	-> locationLib collection will have reference to the patient/caregiver
	//facialId: Schema.ObjectId  -> patients will need images of Caregivers, not himself (for recognition)
})

var patient = mongoose.model('patient',patientSchema);

module.exports = patient;