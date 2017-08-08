var express = require('express');
var FCM = require('fcm-node');
var serverKey = require('../config/fcm.js')
var router = express.Router();
var patient = require('../models/patient');
var circle = require('../models/circle');
var caregiver = require('../models/caregiver');
var contactDetails = require('../models/contactDetails');
var fcm = new FCM(serverKey.serverKey);
var smartReminder = require('../models/smartReminder');
var notificationFrequency = require('../models/notificationFrequency');
var mailgun_util = require('./util/mailgun');
var twilio_util = require('./util/twilio');

//Get Location Reminder Messages and send Push Notifications
router.post('/sendLocationReminders',function(req,res,next){
	var id = req.user._id;
	var requestIds = req.body.requestIds;
	console.log("Request Ids ====="+requestIds);
	//get Registration tokens from email

	patient.find({"userId": id}, function(err, patientdocs){
		if (err) {console.log(err); return next(err) }
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

			caregiver.find({userId:{$in: caregiverArray}}).populate('detailId').populate('facialId').exec(function(err, items){
				//console.log(items);
				if (err) {console.log(err); return next(err) };
				var regTokens = [];
				items.forEach(function(entry){
					entry = entry.toObject();
					regTokens.push(entry.detailId.fcmRegistrationId);
				})
				//TODO: Smart Reminders
					smartReminder.find({_id: requestIds}, function(err, docs){
						if (err) {console.log(err); return next(err) }
									
				
				var msg = docs[0].message;
				console.log(docs)
				console.log(regTokens+" "+msg)
				var message = {
					registration_ids: regTokens,
					notification: {
					title: 'You have a Reminder for your Current Location',
					body:  msg
					}
				}

				fcm.send(message,function(err,response){
						if(err){
							console.log("Could not send notification: "+err);
							data = 'Failed! ';
						}else{
						data = 'Message Successfully Sent!';
					res.json(200,{body:JSON.stringify(data)});

					}
				});

			 });

			});

		});

	});


});
//end of send Notifications


//Get Location Reminder Messages and send Push Notifications
router.post('/sendPatientReminders',function(req,res,next){
	var id = req.user._id;
	var requestIds = req.body.requestIds;
	console.log("Request Ids ====="+requestIds);
	//get Registration tokens from email

	patient.find({"userId": id}, function(err, patientdocs){
		if (err) {console.log(err); return next(err) }
		if(patientdocs.length == 0){console.log("No associated caregivers"); res.json(null);}
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

			caregiver.find({userId:{$in: caregiverArray}}).populate('detailId').populate('facialId').exec(function(err, items){
				//console.log(items);
				if (err) {console.log(err); return next(err) };
				var regTokens = [];
				items.forEach(function(entry){
					entry = entry.toObject();
					regTokens.push(entry.detailId.fcmRegistrationId);
				})
				//TODO: Smart Reminders
					smartReminder.find({_id: requestIds}, function(err, docs){
						if (err) {console.log(err); return next(err) }
									
				
				var msg = docs[0].message;
				console.log(docs)
				console.log(regTokens+" "+msg)
				var message = {
					registration_ids: regTokens,
					notification: {
					title: 'You have a Reminder for your Current Location',
					body:  msg
					}
				}

				fcm.send(message,function(err,response){
						if(err){
							console.log("Could not send notification: "+err);
							data = 'Failed! ';
						}else{
						data = 'Message Successfully Sent!';
					res.json(200,{body:JSON.stringify(data)});

					}
				});

			 });

			});

		});

	});


});
//end of send Notifications



//Sending Geofence Notifications
router.post('/add', function(req, res){
		var data;
		var id = req.user._id;
		var msg = req.body.message;
	
		//get Registration tokens from email

		patient.find({"userId": id}).populate('detailId').exec(function(err, patientdocs){
			if (err) {console.log(err); return next(err) }
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

				caregiver.find({userId:{$in: caregiverArray}}).populate('detailId').populate('facialId').exec(function(err, items){
					//console.log(items);
					if (err) {console.log(err); return next(err) };
					var regTokens = [];
					var msgDetails = [];
					items.forEach(function(entry){
						entry = entry.toObject();
						regTokens.push(entry.detailId.fcmRegistrationId);
						var temp = {};
						temp["email"] = entry.detailId.email;
						temp["phone"] = entry.detailId.phoneNumber;
						msgDetails.push(temp);
					});

					//sending msg and mail
					sendMailandMsg(msgDetails, req);
					var name = patientdocs[0].detailId.name.firstName + " " + patientdocs[0].detailId.name.lastName;
					msg = name +" breached the geo-fence. Current Location: " + msg;

					console.log(regTokens+" "+msg);
					var message = {
						registration_ids: regTokens,
						notification: {
            						title: 'Alert',
            						body:  msg
        					}
					}

					fcm.send(message,function(err,response){
							if(err){
								console.log("Could not send notification: "+err);
								data = 'Failed! ';
							}else{
							data = 'Message Successfully Sent!';


					  }
				res.json({body:JSON.stringify(data)});

				 });

				});

			});

		});


});


router.post('/addPatientNotification', function(req, res){
		var id = req.user._id;
		var requestIds = req.body.requestIds;

		patient.find({"userId" : id}).populate('detailId').exec(function(err, items){
			//console.log(items);
			if (err) {console.log(err); return next(err) };
			
			var regTokens = [];
			regTokens.push(items[0].detailId.fcmRegistrationId);

			smartReminder.find({_id: requestIds}, function(err, docs){
						if (err) {console.log(err); return next(err) }
									
				
				var msg = docs[0].message;
				console.log(docs)
				console.log(regTokens+" "+msg)
				var message = {
					registration_ids: regTokens,
					notification: {
					title: 'You have a Reminder for your Current Location',
					body:  msg
					}
				}

				fcm.send(message,function(err,response){
						if(err){
							console.log("Could not send notification: "+err);
							data = 'Failed! ';
						}else{
						data = 'Message Successfully Sent!';
					res.json(200,{body:JSON.stringify(data)});

					}
				});

			 });
		});
		});

function sendMailandMsg(msgDetails, req)
{
	notificationFrequency.findOneAndUpdate({"patientId": req.user._id},{},{new:true,upsert:true,setDefaultsOnInsert: true, passRawResult: true}, function(err, doc, raw){
			if(!raw.lastErrorObject.updatedExisting ){
		         // new document was created
		         console.log("No notification sent for this patient before. Sending now");
		         msgDetails.forEach(function(entry){
		         	sendMail(entry.email,"Fence Breach Notification",req.body.message);
		         	sendMsg(entry.phone, req.body.message);
		         });
		    }
			//more than an hour old
			else if( new Date().getTime() - doc.timestamp.getTime() > 3600000){
				//update doc and send message
				notificationFrequency.findOneAndUpdate({"patientId": req.user._id},{$set:{"timestamp": Date.now()}},{new:true}, function(err, doc){
					//send msg
					console.log("Last notification sent an hour before. Sending again");
					msgDetails.forEach(function(entry){
			         	sendMail(entry.email,"Fence Breach Notification" ,req.body.message);
			         	sendMsg(entry.phone, req.body.message);
			         });
				});
			}
			else{
				//do nothing
				console.log("A notification has been sent recently. Skipping notification");
			}
	});
};

function sendMsg(to, msg){
	twilio_util.sendMsg(to,msg);
}

function sendMail(to ,subject,msg){
	mailgun_util.sendEmail(to,subject,msg);
}
//End of Sending geoFence Notifications

module.exports = router;

