var express = require('express');
var router = express.Router();
var geoFence = require('../models/geoFence');
var patientLocation = require('../models/locationLibrary');
var caregiver = require('../models/caregiver');
var circle = require('../models/circle');
var utils = require('./util/util');
var mongoose = require('mongoose');

//caregiver will set fence for patient
router.put('/setFence',function(req, res, next){
	geoFence.findOneAndUpdate({caregiverId: req.user._id, patientId:req.body.patientId},{$set:{location: {
			latitude: req.body.latitude,
			longitude: req.body.longitude
		}, radius: req.body.radius}},
		{ upsert: true, new: true}, function(err, docs){
			if (err) {console.log(err); return next(err) }
			res.json(docs);
		});
});

//caregiver to get info for toggle fence and by patient to monitor the boundaries set on him
router.get('/getFence/:patientId',function(req, res, next){
	geoFence.find({patientId: req.params.patientId}, function(err, docs){
		if (err) {console.log(err); return next(err) }
		res.json(200, docs);
	});
});

//patient will get all fences made for him. mobile app should save _id fields returned that will be used when toggling tracking
router.get('/getFence',function(req, res, next){
	geoFence.find({patientId: req.user._id}, function(err, docs){
		if (err) {console.log(err); return next(err) }
		res.json(200, docs);
	});
});

//patient will first find the fences created for him from server and then send location when he is out of a circle
//either patientId or caregiverId will be set, currently only patient will send so functions are according to that
router.post('/fenceBreach',function(req, res, next){
	var new_patientLocation = new patientLocation({
		patientId: req.user._id,	
		caregiverId: req.body.caregiverId,
		latitude: req.body.latitude,
		longitude: req.body.longitude,
		locationDescription: req.body.locationDescription,
		locationName: req.body.locationName
	});

	new_patientLocation.save(function(err, new_patientLocation){
		if(err){console.log(err); return next(err);}
		res.json(200,new_patientLocation);
	})
});

//caregiver will check at regular interval if patient has gone out of range
//Mobile application is responsible for requesting this data at regular intervals
router.post('/alertFenceBreach',function(req, res, next){
	caregiver.find({userId: req.user._id}, function(err, circledocs){
		if (err) {console.log(err); return next(err) }
		//console.log(circledocs); //ids of all circles of a caregiver

		circle.find({_id: { $in: circledocs[0].circleId}}, function(err, patientdocs){
			if (err) {console.log(err); return next(err) }

			var patientsArray = [];
			patientdocs.forEach(function(entry){
				entry = entry.toObject();
				patientsArray.push(entry.patientId);
			})

			patientLocation.aggregate(
				[
				{'$match':{'patientId': {'$in': patientsArray}}},
				{ "$sort": { "patientId":1, "time": 1 } },
				{
					"$group": { 
			            "_id": '$patientId', 
			            "lastLatitude": { $last: "$latitude"},
			            "lastLongitude": { $last: "$longitude"}
			        }
				}
				],
			    function(err,result) {
					if(err){console.log(err); return next(err);}
					res.json(200,result);
			    });

		});

	});
});


router.post('/dashboard/alertFenceBreach', function(req, res, next){
	patientLocation.aggregate(
		[
		{'$match':{'patientId': mongoose.Types.ObjectId(req.body.patientId)}},
		{ "$sort": { "patientId":1, "time": 1 } },
		{
			"$group": { 
	            "_id": '$patientId', 
	            "lastLatitude": { $last: "$latitude"},
	            "lastLongitude": { $last: "$longitude"}
	        }
		}
		],
	    function(err,result) {
			if(err){console.log(err); return next(err);}
			res.json(200,result);
	    });
});


// enable or disable the fence on the patient
//mobile application will also store the _id of all the circles it gets from /getFence as there can be multiple fences for him
//If _id is not stored it becomes a problem while toggling the circle tracking
router.post('/toggleFence',function(req, res, next){
	geoFence.findByIdAndUpdate(req.user._id,{ $set: {"toggleFlag": req.body.toggleFlag}},{new: true}, function(err, docs){
		if (err) {console.log(err); return next(err) }
		res.json(200,docs);
	});
});

module.exports = router;