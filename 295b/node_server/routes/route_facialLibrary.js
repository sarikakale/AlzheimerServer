
/*
Paths being used in this:
1) /createFaceCollection -> used after patient registers and logs in for the first time(requires token)
2) /addFaceToCollection -> to be used every time a patient adds a caregiver to his circles
*/

var express = require('express');
var router = express.Router();
var facialLibrary = require('../models/facialLibrary');
var utils = require('./util/util');
var caregiver = require('../models/caregiver')
var circle = require('../models/circle');
var configS3 = require('../config/secrets.js');
var patient = require('../models/patient');
var AWS = require('aws-sdk');
var multer = require('multer');
var multerS3 = require('multer-s3');


//---------------------------------------AWS S3 PART---------------------------------------

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
router.post('/add', upload.single('uploadedFile'),function(req, res, next) {
  var new_facialLibrary = new facialLibrary({
    imageName: req.file.key,
    imageDescription: req.body.imageDescription,
    imageUrl: req.file.location,
    imageMetadata: req.file.metadata
  });

  new_facialLibrary.save(function(err, new_facialLibrary){
        if(err){console.log(err);return next(err);}

        caregiver.findOneAndUpdate({"userId": req.user._id},{$set:{"facialId": new_facialLibrary._id}},{new: true}, function(err, caregiver_doc){
          if (err) {console.log(err); return next(err) }
          res.json(201,caregiver_doc);
        });
    });
});


//-------------------------AWS REKOGNITION PART---------------------------------------

// Create an S3 client
var rekognition = new AWS.Rekognition({
accessKeyId: configS3.s3_accessKeyId,
secretAccessKey: configS3.s3_secretAccessKey,
region: configS3.s3_region
});

var storage = multer.memoryStorage();
var facial_buffer = multer({ storage: storage });


//Each patient will have his own face collection which will store image stats of all caregivers related to patient
router.get('/createFaceCollection', function(req, res, next){
  createcollparam = {CollectionId: req.user._id.toString()};
  rekognition.createCollection(createcollparam, function(err, data){
    if(err){console.log(err);return next(err);} // an error occurred
     else     console.log(data);res.json(201,data);          // successful response
  });
});

//Each face has to be individually added to the face collection created by the patient
//image was saved with key as caregiver id, which is now used to select the image
router.post('/addFaceToCollection', function(req, res, next){
  var indexFacesParam ={
    CollectionId: req.user._id.toString(), //patientid
    DetectionAttributes: [
    ], 
    ExternalImageId: req.body.caregiverId, 
    Image: {
     S3Object: {
      Bucket: configS3.s3_bucket, 
      Name: req.body.caregiverId
     }
    }
   };
  rekognition.indexFaces(indexFacesParam, function(err, data){
    if(err){console.log(err);return next(err);} // an error occurred
     else     console.log(data);res.json(201,data);        // successful response
  });
});

//The patient takes a picture using the Android application which is converted into blob and then used to search
router.post('/searchFaceByImage',facial_buffer.single('uploadedFile'), function(req, res, next){
  var searchFacesByImageParams = {
    CollectionId: req.user._id.toString(), 
    FaceMatchThreshold: 75, 
    Image: {
     Bytes: req.file.buffer   //new Buffer('....') //replace by image recieved using multer
    }, 
    MaxFaces: 1
   };
  rekognition.searchFacesByImage(searchFacesByImageParams, function(err, data) {
     if(err){console.log(err);return next(err);} // an error occurred
     if(data.FaceMatches.length == 0){
      console.log("Face could not be recognized.");
      return res.json(404,{FaceMatches:"No caregiver could be identified"});
     }
     console.log(data);
     caregiver.find({"userId": data.FaceMatches[0].Face.ExternalImageId}, function(err, caregiver_doc){
      res.json(200,caregiver_doc); //caregiver found
     });
  });
});


//get images for a patient
router.get('/getImages',function(req, res, next){
  var pID = utils.selectUserType(req);


/*patient.find({"userId": req.user._id}, function(err, patientdocs){
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
			

			facialLibrary.find({"imageName": {$in: caregiverArray}},function(err, docs){
				if(err){console.log(err);return next(err);} // an error occurred
     				else     console.log(docs);res.json(201,docs);// successful response	
	});

		}); 

	});
*/
var params = {
  CollectionId: pID, /* required */
  MaxResults: 20
};
var urls=[];
rekognition.listFaces(params, function(err, data) {

	console.log(data);
	data.Faces.forEach(function(entry){
			console.log("Entry"+entry);				  		
	var pms= {
		Bucket: configS3.s3_bucket,
		Key: entry.ExternalImageId
	}
	
	s3.getSignedUrl('getObject', pms, function (err, url) {
	  console.log('The URL is', url);
		urls.push(url);
		if(err){console.log(err);return next(err);} // an error occurred
	
	});
	});
	console.log(urls)
	res.send(201,urls)
	
});
	
 });

router.get('/getFriendsImage/:patientId',function(req, res, next){
	  var pID = req.params.patientId;

	/*patient.find({"userId": pID},function(err,patientdocs){
		facialLibrary.find({"_id": patientdocs.facialId},function(err, docs){
			if(err){console.log(err);return next(err);} // an error occurred
     			else     console.log(data);res.json(201,docs);// successful response	
		});
   	});*/

	var params = {
 	 CollectionId: pID, /* required */
	  MaxResults: 20
	};
	var urls=[];
	rekognition.listFaces(params, function(err, data) {

		console.log(data);
		data.Faces.forEach(function(entry){
			console.log("Entry"+entry);				  		
		var pms= {
			Bucket: configS3.s3_bucket,
			Key: entry.ExternalImageId
		}
	
	s3.getSignedUrl('getObject', pms, function (err, url) {
	  console.log('The URL is', url);
		urls.push(url);
		if(err){console.log(err);return next(err);} // an error occurred
	
		});
		});
		console.log(urls)
		res.send(201,urls)
	
	});
	
 });
module.exports = router;

  var params = {
    CollectionId: pID, /* required */
    MaxResults: 20
  };
  var urls=[];
  rekognition.listFaces(params, function(err, data) {

    console.log(data);
    data.Faces.forEach(function(entry){
        console.log("Entry"+entry);             
    var pms= {
      Bucket: configS3.s3_bucket,
      Key: entry.ExternalImageId
    }
    
    s3.getSignedUrl('getObject', pms, function (err, url) {
      console.log('The URL is', url);
      urls.push(url);
      if(err){console.log(err);return next(err);} // an error occurred
    
    });
    });
    console.log(urls)
    res.send(201,urls)
    
  });
  
 });

router.get('/getFriendsImage/:patientId',function(req, res, next){
  var pID = req.params.patientId;
  var params = {
   CollectionId: pID, /* required */
    MaxResults: 20
  };
  var urls=[];
  rekognition.listFaces(params, function(err, data) {

    console.log(data);
    data.Faces.forEach(function(entry){
      console.log("Entry"+entry);             
    var pms= {
      Bucket: configS3.s3_bucket,
      Key: entry.ExternalImageId
    }
  
  s3.getSignedUrl('getObject', pms, function (err, url) {
    console.log('The URL is', url);
    urls.push(url);
    if(err){console.log(err);return next(err);} // an error occurred
  
    });
    });
    console.log(urls)
    res.send(201,urls)
  
  });
  
 });
module.exports = router;

