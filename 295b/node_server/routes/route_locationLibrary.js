var locationLibrary = require('../models/locationLibrary');
var express = require('express');
var router = express.Router();


/*

POSSIBLE DUPLICATE AS FUNCTIONALITY COVERED IN GEOFENCE ROUTE

router.post('/add',function(req, res, next){
	var new_location = new locationLibrary({
		caregiverId : req.user._id,
		latitude: req.body.latitude,
		longitude: req.body.longitude,
		locationDescription: req.body.locationDescription,
		locationName: req.body.locationName
	});
	new_location.save(function (err, new_location) { 
		if (err) {console.log(err); return next(err) }
		res.json(201, new_location);
	});
});

*/
module.exports = router;
