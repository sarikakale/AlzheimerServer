var express = require('express');
var contactDetails = require('../models/contactDetails');
var router = express.Router();

router.post('/fcmRegistration', function(req, res, next){
	
	console.log(req.user.email+" "+req.body);

	var email = req.user.email;
	var registrationId = req.body.registrationId
	
	contactDetails.findOneAndUpdate({email: email}, {$set: {fcmRegistrationId: registrationId}}, function(err,user){
			if(err){
				console.log(err)
				next(err)
			}
			res.status(201).json(user)
			
		})
});

module.exports = router;
