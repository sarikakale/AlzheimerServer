var express = require('express');
var router = express.Router();
var caregiver = require('../models/caregiver');
var user = require('../models/user');
var contactDetails = require('../models/contactDetails');
var circle = require('../models/circle');
var patient = require('../models/patient');
var mongoose = require('mongoose');

//get all caregivers
router.get('/',function(req, res, next){
	caregiver.find({}, function (err, docs) {
	  if (err) {console.log(err); return next(err) }
		res.json(200, docs)
	});
});


//get caregiver details
router.get('/details',function(req, res, next){
	contactDetails.find({email: req.user.email}, function(err, docs){
		if (err) {console.log(err); return next(err) }
		res.json(200, docs);	
	});
});


//add circle entry in caregiver and add caregiver entry in circle
router.post('/addCircle',function(req, res, next){
	circle.findOneAndUpdate({"patientID": req.user._id, "circleName": req.body.circleName},{$push:{"caregivers": req.body.caregiverId}},{new: true}, function(err, circledoc){
		if (err) {console.log(err); return next(err) }
		if(circledoc.length == 0){console.log("circle not found"); return res.json(null);}		
		caregiver.findOneAndUpdate({"userId": req.body.caregiverId},{$push:{"circleId": circledoc._id}},{new: true}, function(err, caregivers){
			if (err) {console.log(err); return next(err) }
			res.json(200,caregivers);
		});
	});
});

//remove circle entry from caregiver and remove caregiver entry from circle
router.post('/removeCircle',function(req, res, next){

	circle.findOneAndUpdate({"patientID": req.user._id, "circleName": req.body.circleName},{$pull:{"caregivers": req.body.caregiverId}},{new: true}, function(err, circledoc){
		if (err) {console.log(err); return next(err) }
		if(circledoc.length == 0){console.log("circle not found"); return res.json(null);}
		caregiver.findOneAndUpdate({"userId": req.body.caregiverId},{$pull:{"circleId": circledoc._id}},{new: true}, function(err, caregivers){
			if (err) {console.log(err); return next(err) }
			res.json(200,caregivers);
		});
	});
});

//find all patients that have user as caregiver
router.get('/getPatients', function(req, res, next){
	caregiver.find({"userId":req.user._id}, function(err, caregiverdocs){
		if (err) {console.log(err); return next(err) }
		if(caregiverdocs.length == 0){console.log("No associated patients"); return res.json(null);}
		//console.log(caregiverdocs); //ids of all circles of a caregiver
		
		circle.find({_id: { $in: caregiverdocs[0].circleId}}, function(err, circledocs){
			if (err) {console.log(err); return next(err) }
			var patientArray = [];
			circledocs.forEach(function(entry){
				entry = entry.toObject();
				patientArray.push(entry.patientID);
			});

		//console.log(circledocs);

		patient.find({userId: { $in: patientArray}}).populate('detailId').exec(function(err, items){
			//console.log(items);
			if (err) {console.log(err); return next(err) };
			res.json(200,items);
		});

		}); 

	});
});

module.exports = router;
