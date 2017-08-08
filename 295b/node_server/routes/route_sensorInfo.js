var express = require('express');
var router = express.Router();
var sensorInfo = require('../models/sensorInfo');
var fitbituser = require('../models/fitbituser');

//add daily sensorinfo
router.post('/addDailySensorinfo', function(req, res, next){
	var new_sensorInfo = new sensorinfo({
		patientId: req.user._id,
		date: req.body.date,
		summary: req.body.summary
	});
	new_sensorInfo.save(function(err, new_sensorInfo){
		if (err) {console.log(err); return next(err) }
		res.json(201, new_sensorInfo);
	});
});

//route to get all sensor info in between fromDate and toDate
//required date format -> '2014-01-22T14:56:59.301Z'
router.get('/getDailyStats', function(req, res, next){
	if(req.body.fromDate == null){
		sensorinfo.find({"date":{"$lte": new Date(req.body.toDate)}, "patientId": req.user._id}, function(err, docs){
			if (err) {console.log(err); return next(err) }
			res.json(200, docs);
		});
	}
	else if(req.body.toDate == null){
		sensorinfo.find({"date":{"$gte": new Date(req.body.fromDate)}}, function(err, docs){
			if (err) {console.log(err); return next(err) }
			res.json(200, docs);
		});
	}
	else{
		sensorinfo.find({"date":{"$gte": new Date(req.body.fromDate), "$lt": new Date(req.body.toDate)}}, function(err, docs){
			if (err) {console.log(err); return next(err) }
			res.json(200, docs);
		});
	}
	
});

//get patientcred for dashboard
//not the correct way //to be corrected later
router.post('/getPatientCred', function(req, res, next){
	fitbituser.find({"patientId": req.body.patientId}, function(err, docs){
		if (err) {console.log(err); return next(err) }
			res.json(200, docs);
	});
});

module.exports = router;
