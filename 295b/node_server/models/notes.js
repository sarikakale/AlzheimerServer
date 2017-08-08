var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var notesSchema = new Schema({
	//circleId: {type: String, unique: true, required: true},	//circleId will be unique and will be present in patient and caregiver collection
	patientID: {type: Schema.Types.ObjectId, ref: "patient"},
	Note: String
});

var notes = mongoose.model('notes',notesSchema);

module.exports = notes;