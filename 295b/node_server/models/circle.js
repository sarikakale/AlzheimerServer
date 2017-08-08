var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var circleSchema = new Schema({
	//circleId: {type: String, unique: true, required: true},	//circleId will be unique and will be present in patient and caregiver collection
	patientID: {type: Schema.Types.ObjectId},
	circleName: String,
	caregivers: [{type: Schema.Types.ObjectId}], //array of object id's from caregiver collection	[caregiverId1,caregiverId2]
	accessLevel: Schema.Types.Mixed //entire circle will have single permission
});

circleSchema.virtual('caregiver_details',{
	ref: 'caregiver',
	localField: 'caregivers',
	foreignField: 'userId'
});

circleSchema.virtual('patient_details',{
	ref: 'patient',
	localField: 'patientID',
	foreignField: 'userId'
});

circleSchema.set('toObject', { virtuals: true });
circleSchema.set('toJSON', { virtuals: true });

var circle = mongoose.model('circle',circleSchema);

module.exports = circle;

/*circle.findOne({patientId: req.body.patientId, caregivers: req.user._id}, function(err, circledoc){
	if(circledoc.accessLevel.location == false){
		//return pehle hi
	}
});*/
