var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var contactDetailsSchema = new Schema({
	//detailId: {type: String, unique: true, required: true},
	name:{
		firstName: String,
		middleName: String,
		lastName: String
	},
	address:{
		street: String,
		city: String,
		state: String,
		zipcode: Number,
		country: String
	},
	phoneNumber: {type: String, unique: true, required: true},
	email: {type: String, unique: true, required: true},
	fcmRegistrationId: {type: String}
});


var contactDetails = mongoose.model('contactDetails',contactDetailsSchema);

module.exports = contactDetails;
