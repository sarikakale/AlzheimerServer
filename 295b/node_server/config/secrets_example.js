//create file secrets.js
module.exports = {

  	'secret': 'replace by secret passphrase',
  	's3_accessKeyId': 'replace by s3_accessKeyId',
  	's3_secretAccessKey': 'replace by s3_secretAccessKey',
  	's3_bucket': 'replace by s3_bucketname',
  	's3_region': 'replace by s3 region', //eg: us-west-2
  	'mailgun_api_key': 'replace by api key',
  	'mailgun_domain': 'replace by mailgun domain',
  	'fitbit_client_id': 'replace by fitbit app client id',
  	'fitbit_client_secret': 'replace by fitbit app client secret',
  	'twilio_accountSid ': 'replace by twilio accountSid',
  	'twilio_authToken': 'replace by twilio authToken',
  	'twilio_fromPhone': 'replace by twilio phone number which is fixed'
};

/*NOTE: It is important that the region of AWS S3 and AWS Rekognition are the same and
 as AWS Rekognition is only supported in certain regions, try selection region:
 US West (Oregon)	us-west-2
 If you want to selct other region please check common regions between S3 and Rekognition
 from this webpage: http://docs.aws.amazon.com/general/latest/gr/rande.html */
