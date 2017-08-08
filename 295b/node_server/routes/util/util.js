module.exports = {
  selectUserType: function(req){
	  var pID;
	  //if caregivers uses this, body will have patientId
	  if(typeof(req.body.patientId) == "undefined" || req.body.patientId == "" ||req.body.patientId == null){
	    pID = req.user._id.toString();
	  }
	  else{
	    pID = req.body.patientId;
	  }
	  return pID
	}
};