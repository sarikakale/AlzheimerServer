var express = require('express');
var router = express.Router();
var circle = require('../models/circle');

//test path // not to be used
router.post('/checkAccess', function(req, res){
	circle.findOne({patientID: req.body.patientId, caregivers: req.user._id}, function(err, circledoc){
		if(circledoc.accessLevel.location == false){
			//return unauthorized
			res.json({"ret": "unauthorized"})
		}
		else{
			res.json({"ret": "authorized"})
			//proceed with requests
		}
	});
});

module.exports = router;
