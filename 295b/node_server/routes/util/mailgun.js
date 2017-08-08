var secrets = require('../../config/secrets.js');
var api_key = secrets.mailgun_api_key;
var domain = secrets.mailgun_domain;
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});

module.exports = {
	sendEmail: function(to, subject, body){
		var data = {
		  from: 'Alzheimers Assistant <alerts@alzheimers_assistant.org>',
		  to: to,
		  subject: subject,
		  text: body
		};
		mailgun.messages().send(data, function (error, body) {
		  console.log(body);
		  if(error)console.log(error);
		});
	}
};