var express = require('express');
var router = express.Router();
var smartReminder = require('../models/smartReminder');
var utils = require('./util/util');

//add a reminder
router.post('/addReminder', function(req, res, next){
	pId = utils.selectUserType(req);

	var new_smartReminder = new smartReminder({
		patientId: pId,
		location: {
			latitude: req.body.latitude,
			longitude: req.body.longitude
		},
		message: req.body.message
	});
	new_smartReminder.save(function(err, new_smartReminder){
		if (err) {console.log(err); return next(err) }
		res.json(201, new_smartReminder);
	});
});

//get all reminders saved by a patient and then save them on the android app
router.get('/getReminders', function(req, res, next){
	console.log("error");
	smartReminder.find({patientId: req.user._id}, function(err, docs){
		if (err) {console.log(err); return next(err) }
		res.json(200, docs);
	});
});

//get all reminders saved by a patient and then save them on the android app
router.get('/getReminders/:patientId', function(req, res, next){
	smartReminder.find({patientId: req.params.patientId}, function(err, docs){
		if (err) {console.log(err); return next(err) }
		res.json(200, docs);
	});
});

//get all reminders saved by a patient and then save them on the android app
router.post('/deleteReminder', function(req, res, next){
	var reminderId = req.body.reminderId;
	smartReminder.remove({_id: reminderId}, function(err, docs){
		if (err) {console.log(err); return next(err) }
		res.json(200, docs);
	});
});

module.exports = router;

