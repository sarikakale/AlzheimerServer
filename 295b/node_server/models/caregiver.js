var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var cargiverSchema = new Schema({
	userId: {type: Schema.ObjectId, unique: true},	//objectId of user document
	detailId: {type: Schema.ObjectId, ref: "contactDetails"},
	facialId: {type: Schema.ObjectId, ref: "facialLibrary"}, //single image will be enough when using AWS rekognition
	circleId: [{type: Schema.Types.ObjectId, ref: "circle"}],			//multiple circles can be present array of object id
});

var caregiver = mongoose.model('caregiver',cargiverSchema);

module.exports = caregiver;