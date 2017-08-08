var express = require('express');
var contactDetails = require('../models/contactDetails');
var patient = require('../models/patient');
var circle = require('../models/circle');
var caregiver = require('../models/caregiver');
var router = express.Router();
var facialLibrary = require('../models/facialLibrary');
var configS3 = require('../config/secrets.js');
var AWS = require('aws-sdk');
var multer = require('multer');
var multerS3 = require('multer-s3');




//adding details of user
router.post('/add', function(req, res, next){
	//console.log(req.body)
	var new_contactDetails = new contactDetails({
		name: req.body.name,
		address: req.body.address,
		email: req.body.email,
		phoneNumber: req.body.phoneNumber
	});

	new_contactDetails.save(function(err, new_contactDetails){
		if (err) {console.log(err); return next(err) }
		res.status(201).json(new_contactDetails);
	})
});

//add a caregiver
router.post('/addCaregiver',function(req, res, next){
	var new_caregiver = new caregiver({
		userId: req.user._id,
		detailId: req.body.detailId,
		facialId: req.body.facialId,
		//circleId: req.body.circleId //circles are added later
	});
	new_caregiver.save(function (err, new_caregiver) { 
		if (err) {console.log(err); return next(err) }
		res.json(201, new_caregiver);
	});
});

//add patient entry in patient schema
//3 predefined circles are also added for each patient
// caregivers will have to added seperately into those circles
router.post('/addPatient', function(req, res, next){
	var family_circle = new circle({
		patientID: req.user._id,
		circleName: "Family",
		caregivers: [],
		accessLevel: {"location": true,
					  "notes": true,
					  "vitals": true}
	});
	var friends_circle = new circle({
		patientID: req.body.userId,
		circleName: "Friends",
		caregivers: [],
		accessLevel: {"location": true,
					  "notes": true,
					  "vitals": false}
	});
	var neighbors_circle = new circle({
		patientID: req.body.userId,
		circleName: "Neighbors",
		caregivers: [],
		accessLevel: {"location": true,
					  "notes": false,
					  "vitals": false}
	});

	circle.insertMany([family_circle, friends_circle, neighbors_circle], function(err, docs){
		var circleIds = [];
		docs.forEach(function(circle){
			circleIds.push(circle._id);
		});
		var new_patient = new patient({
			userId: req.user._id,
			detailId: req.body.detailId,
			circleId: circleIds
		});

		new_patient.save(function(err, new_patient){
			if(err){return next(err);}
			res.status(201).json(new_patient);
		});

	});

	
});






//TEMP ROUTE

// Create an S3 client
var s3 = new AWS.S3({
accessKeyId: configS3.s3_accessKeyId,
secretAccessKey: configS3.s3_secretAccessKey
});

var upload = multer({
 storage: multerS3({
   s3: s3,
   bucket: configS3.s3_bucket,
   metadata: function (req, file, cb) {
     cb(null, {caregiverId: req.body.imageName});
   },
   key: function (req, file, cb) {
     cb(null, req.body.imageName);	
   },
   acl: 'public-read'
 })
});

//request sent should have form/multipart header and the file should be under field uploadedFile
// imageName parameter in the body should be caregiver Id => this id will be used later in creating collection
router.post('/addFace', upload.single('uploadedFile'),function(req, res, next) {
  var new_facialLibrary = new facialLibrary({
    imageName: req.file.key,
    imageDescription: req.body.imageDescription,
    imageUrl: req.file.location,
    imageMetadata: req.file.metadata
  });

  new_facialLibrary.save(function(err, new_facialLibrary){
        if(err){console.log(err);return next(err);}

        caregiver.findOneAndUpdate({"userId": req.body.imageName},{$set:{"facialId": new_facialLibrary._id}},{new: true}, function(err, caregiver_doc){
          if (err) {console.log(err); return next(err) }
          res.json(201,caregiver_doc);
        });
    });
});


module.exports = router;
