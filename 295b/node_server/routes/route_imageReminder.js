var express = require('express');
var router = express.Router();
var facialLibrary = require('../models/facialLibrary');
var imageReminder = require('../models/imageReminder');
var caregiver = require('../models/caregiver')
var configS3 = require('../config/secrets.js');

var AWS = require('aws-sdk');
var multer = require('multer');
var multerS3 = require('multer-s3');
const uuidV1 = require('uuid/v1');
var utils = require('./util/util');

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
     cb(null, {name: req.body.name});
   },
   key: function (req, file, cb) {
     cb(null, uuidV1());  
   },
   acl: 'public-read'
 })
});

//request sent should have form/multipart header and the file should be under field uploadedFile
// imageName parameter in the body should be caregiver Id => this id will be used later in creating collection
router.post('/addImageAndReminder', upload.single('uploadedFile'),function(req, res, next) {
  var pID = utils.selectUserType(req);
  //console.log(req.url);
  var indexFacesParam ={
    CollectionId: pID, //patientid
    DetectionAttributes: [
    ], 
    ExternalImageId: req.file.key, 
    Image: {
     S3Object: {
      Bucket: configS3.s3_bucket, 
      Name: req.file.key
     }
    }
   };
  
  var new_imageReminder = new imageReminder({
    friendId : req.file.key,
    patientId: pID,
    name: req.body.name,
    message: req.body.message
  });

  new_imageReminder.save(function(err, docs){
    if (err) {console.log(err); return next(err) }
    rekognition.indexFaces(indexFacesParam, function(err, data){
      if(err){console.log(err);return next(err);} // an error occurred
       else     console.log(data);res.status(201).json({"reminder": docs, "indexing": data});  // successful response
    });
  });
});

//uploaded image is a caregivers image so we wont save again in AWS S3
// Just associate remiinder with caregiver
router.post('/addOnlyReminder', function(req, res, next){
  console.log("in add addOnlyReminder");
  var pID = utils.selectUserType(req);
  var new_imageReminder = new imageReminder({
    friendId : req.body.caregiverId,
    patientId: pID,
    name: req.body.name,
    message: req.body.message
  });

  new_imageReminder.save(function(err, docs){
    if (err) {console.log(err); return next(err) }
    res.status(201).json(docs);
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


//check by hitting this API if the iamge of the person has already been uploaded
//if found, returned userId will be the s3 key of object and ExternalImageId also -> use addOnlyReminder
//if not found, 404 is returned -> use addImageAndReminder
router.post('/checkIfImageUploaded',facial_buffer.single('uploadedFile'), function(req, res, next){
  var pID = utils.selectUserType(req);
  var searchFacesByImageParams = {
    CollectionId: pID, 
    FaceMatchThreshold: 50, 
    Image: {
     Bytes: req.file.buffer   //new Buffer('....') //replace by image recieved using multer
    }, 
    MaxFaces: 1
   };
  rekognition.searchFacesByImage(searchFacesByImageParams, function(err, data) {
     if(err){console.log(err);return next(err);} // an error occurred
     if(data.FaceMatches.length == 0){
      console.log("Face has not been uploaded previously.");
      return res.status(404).json({FaceMatches:"Face has not been uploaded previously."});
     }
     else{
      console.log(data);
       caregiver.find({"userId": data.FaceMatches[0].Face.ExternalImageId}, function(err, caregiver_doc){
        if(err){console.log(err);return next(err);}
        res.status(200).json(caregiver_doc); //caregiver found
       }); 
     }
     
  });
});


//search reminder by uploading image of a person
router.post('/getReminderByImage',facial_buffer.single('uploadedFile'), function(req, res, next){
  var pID = utils.selectUserType(req);
  var searchFacesByImageParams = {
    CollectionId: pID, 
    FaceMatchThreshold: 50, 
    Image: {
     Bytes: req.file.buffer   //new Buffer('....') //replace by image recieved using multer
    }, 
    MaxFaces: 1
   };
  rekognition.searchFacesByImage(searchFacesByImageParams, function(err, data) {
     if(err){console.log(err);return next(err);} // an error occurred
     console.log(data);
     if(data.FaceMatches.length == 0){
      res.status(404).json({FaceMatches:"No reminders associated with this person"});
     }
     else{
       console.log(data.FaceMatches.length);
       imageReminder.find({"friendId": data.FaceMatches[0].Face.ExternalImageId, patientId: pID}, function(err, reminder_docs){
          if(err){console.log(err);return next(err);} // an error occurred
          res.status(200).json(reminder_docs); //caregiver found
       });
     }
     
  });
});

module.exports = router;
