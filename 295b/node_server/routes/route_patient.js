var express = require('express');
var router = express.Router();
var patient = require('../models/patient');
var circle = require('../models/circle');
var caregivers = require('../models/caregiver');
var contactDetails = require('../models/contactDetails');
var fitbituser = require('../models/fitbituser');



//fetch contactDetails
router.get('/details',function(req, res, next){
	contactDetails.find({email: req.user.email}, function(err, docs){
		if (err) {console.log(err); return next(err) }
		res.json(200, docs);	
	})
});


/*change circle access level by sending accessLevel object

sample accessLevel object
{"Family":{
	location": true,
	"notes": false,
	"vitals": true},
"Friends":{
	location": true,
	"notes": false,
	"vitals": true},
"Neighbors":{
	location": true,
	"notes": false,
	"vitals": true},
}
*/
router.post('/changeCircleAccess', function(req, res, next){
	req.body.accessLevel = JSON.parse(req.body.accessLevel);
	circle.findOneAndUpdate({"patientID": req.user._id, "circleName": "Family"},{ $set: {"accessLevel": req.body.accessLevel.Family}},{new: true}, function(err, family){
		if (err) {console.log(err); return next(err) }
		circle.findOneAndUpdate({"patientID": req.user._id, "circleName": "Friends"},{ $set: {"accessLevel": req.body.accessLevel.Friends}},{new: true}, function(err, friends){
			if (err) {console.log(err); return next(err) }
			circle.findOneAndUpdate({"patientID": req.user._id, "circleName": "Neighbors"},{ $set: {"accessLevel": req.body.accessLevel.Neighbors}},{new: true}, function(err, neighbors){
				if (err) {console.log(err); return next(err) }
				res.json(200,{"Family":family, "Friends":friends,"Neighbors":neighbors});
			});
		});
	});
});

/*
//NOT BEING USED
//create a circle 
router.post('/addCircle',function(req, res, next){
	var new_circle = new circle({
		patientID: req.user._id,
		circleName: req.body.circleName,
		caregivers: [],	//caregivers will be added into the circle separately
		accessLevel: req.body.accessLevel
	});
	new_circle.save(function (err, new_circle) { 
		if (err) {console.log(err); return next(err) }
		res.json(201, new_circle);
	});
});
*/

//delete a circle
router.post('/deleteCircle', function(req, res, next){
	circle.findOne({_id: req.body.circleId}, function(err, circleInfo){
		if (err) {console.log(err); return next(err) }
		circle.remove({_id: req.body.circleId}, function(err, docs){
			if (err) {console.log(err); return next(err) }
			caregivers.update({"userId":{$in: circleInfo.caregivers}},{$pull:{"circleId": req.body.circleId}},{multi: true}, function(err, docs){
				if (err) {console.log(err); return next(err) }
				patient.update({"userId": circleInfo.patientID},{$pull:{"circleId": req.body.circleId}}, function(err, docs){
					if (err) {console.log(err); return next(err) }
					res.json(200,"circle deleted");
				});	
			});
		});
	});
});

//find all caregivers that monitor the patient
router.get('/getCaregivers', function(req, res, next){
	patient.find({"userId": req.user._id}, function(err, patientdocs){
		if(err){console.log(err); return next(err) }
		if(patientdocs.length == 0){console.log("No associated caregivers"); return res.json(null);}
		//console.log(patientdocs); //ids of all circles of a caregiver

		circle.find({_id: { $in: patientdocs[0].circleId}}, function(err, circledocs){
			if (err) {console.log(err); return next(err) }

			var caregiverArray = [];
			circledocs.forEach(function(entry){
				entry = entry.toObject();
				entry.caregivers.forEach(function(caregiverEntry){
					caregiverArray.push(caregiverEntry);
				});
				
			});
			//console.log(caregiverArray);

			caregivers.find({userId:{$in: caregiverArray}}).populate('detailId').populate('facialId').exec(function(err, items){
				//console.log(items);
				if (err) {console.log(err); return next(err) };
				res.json(200,items);
			});

		}); 

	});
});


//find all caregivers that monitor the patient
router.get('/getCaregiversForPatients/:patientId', function(req, res, next){
	patient.find({"userId": req.params.patientId}, function(err, patientdocs){
		if(err){console.log(err); return next(err) }
		if(patientdocs.length == 0){console.log("No associated caregivers"); return res.json(null);}
		//console.log(patientdocs); //ids of all circles of a caregiver

		circle.find({_id: { $in: patientdocs[0].circleId}}, function(err, circledocs){
			if (err) {console.log(err); return next(err) }

			var caregiverArray = [];
			circledocs.forEach(function(entry){
				entry = entry.toObject();
				entry.caregivers.forEach(function(caregiverEntry){
					caregiverArray.push(caregiverEntry);
				});
				
			});
			//console.log(caregiverArray);

			caregivers.find({userId:{$in: caregiverArray}}).populate('detailId').populate('facialId').exec(function(err, items){
				//console.log(items);
				if (err) {console.log(err); return next(err) };
				res.json(200,items);
			});

		}); 

	});
});


//not ready yet

router.get('/getCircleDetails', function(req, res, next){
	circle.find({"patientID": req.user._id}).populate({path: "patient_details", populate: [{path: "detailId"}]}).populate({path: "caregiver_details", populate: [{path: "detailId"},{path: "facialId"}]}).exec(function(err, items){
		if(err){console.log(err); return next(err) }
		res.json(200,items);
	});
});

//find all caregivers that haven't been added to patient's circles
router.get('/getNewCaregivers', function(req, res, next){
	patient.find({"userId": req.user._id}, function(err, patientdocs){
		if(err){console.log(err); return next(err) }
		if(patientdocs.length == 0){console.log("No associated caregivers"); return res.json(null);}
		//console.log(patientdocs); //ids of all circles of a caregiver

		circle.find({_id: { $in: patientdocs[0].circleId}}, function(err, circledocs){
			if (err) {console.log(err); return next(err) }

			var caregiverArray = [];
			circledocs.forEach(function(entry){
				entry = entry.toObject();
				entry.caregivers.forEach(function(caregiverEntry){
					caregiverArray.push(caregiverEntry);
				});
				
			});
			//console.log(caregiverArray);

			caregivers.find({userId:{$nin: caregiverArray}}).populate('detailId').populate('facialId').exec(function(err, items){
				//console.log(items);
				if (err) {console.log(err); return next(err) };
				res.json(200,items);
			});

		}); 

	});
});

//fetch contactDetails
router.post('/linkFitbitDetails',function(req, res, next){
	fitbituser.findOneAndUpdate({linkToPatient: req.body.linkId},{$set:{patientId: req.user._id}}, function(err, docs){
		if (err) {console.log(err); return next(err) }
		res.json(200, docs);	
	});
});

//fetch contactDetails
router.post('/updateFitbitToken',function(req, res, next){
	fitbituser.findOneAndUpdate({fitbitId: req.body.user_id},{$set:{refreshToken: req.body.refreshToken, accessToken: req.body.accessToken}}, function(err, docs){
		if (err) {console.log(err); return next(err) }
		res.json(200, docs);	
	});
});
     
module.exports = router;
