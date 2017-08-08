var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var facialLibSchema = new Schema({
  //facialImageId: {type: String, unique: true, required: true},
  imageName: String,
  imageDescription: String,
  imageUrl: String,
  imageMetadata: Schema.Types.Mixed
});

var facialLibrary = mongoose.model('facialLibrary', facialLibSchema);

module.exports = facialLibrary;