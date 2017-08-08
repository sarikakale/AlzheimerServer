var twilio = require('twilio');
var secrets = require('../../config/secrets.js');
var accountSid = secrets.twilio_accountSid;
var authToken = secrets.twilio_authToken;
var fromNumber = secrets.twilio_fromPhone;

var client = new twilio(accountSid, authToken);

module.exports = {
	sendMsg: function(to,msgBody){
		console.log("sending msg");
		client.messages.create({
		    body: msgBody,
		    to: to,  // Text this number
		    from: fromNumber // From a valid Twilio number
		}, function(err, message) {
			    if(err) {
			        console.error(err.message);
			    }
			});
		
	}
};