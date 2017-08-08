var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var mediaLibSchema = new Schema({
  //patientId
  mediaId: {type: String, unique: true, required: true},
  mediaType: String,
  mediaName: String,
  mediaDescription: String,
  mediaUrl: String,
});

var mediaLibrary = mongoose.model('mediaLibrary', mediaLibSchema);

module.exports = medialibrary;