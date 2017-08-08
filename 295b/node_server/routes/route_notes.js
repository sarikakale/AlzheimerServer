var express = require('express');
var router = express.Router();
var notes = require('../models/notes');
var utils = require('./util/util');

//add a new note
router.post('/add', function(req, res, next){
	var pID = utils.selectUserType(req);
	var new_note = new notes({
		patientID: pID,
		Note: req.body.message
	});

	new_note.save(function(err, new_note){
		if(err){return next(err);}
		res.status(201).json(new_note);
	});
});


//fetch all notes
router.get('/get', function(req, res, next){
	var pID = utils.selectUserType(req);
	notes.find({patientID: pID}, function(err, docs){
		if(err){return next(err);}
		res.status(200).json(docs);
	});
});

//delete note by id
router.post('/delete', function(req, res, next){
	var pID = utils.selectUserType(req);
	notes.remove({_id: req.body._id}, function(err){
		if(err){return next(err);}
		res.status(200).json({"status": "Successfully deleted the note"});
	});
});


module.exports = router;