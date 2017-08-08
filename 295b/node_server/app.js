var express = require('express');
var app = express();
var cors = require('cors');
var port = process.env.PORT || 8080;
var mongoose = require('mongoose').set('debug', true);

var passport = require('passport');
var morgan       = require('morgan');
var bodyParser   = require('body-parser');
var configDB = require('./config/database.js');

var bodyParser = require('body-parser');

const events = require('events');
var eventEmitter = new events.EventEmitter();

app.use(express.static('dist'));

app.use(cors());
//app.options('*', cors());

app.set('view engine', 'ejs');

//use body parser to get POST requests
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

require('./config/passport')(passport);


app.use(morgan('dev')); // log every request to the console

// required for passport
app.use(passport.initialize());

mongoose.connect(configDB.url);

app.use(function(req, res, next) {
  console.log(req.body);
  console.log(req.headers);
  next();
});

var authenticate_route = require('./routes/authenticate_route');
var route_caregivers = require('./routes/route_caregiver');
var route_fcm = require('./routes/route_fcm');
var route_contactDetails = require('./routes/route_contactDetails');
var route_circle = require('./routes/route_circle');
var route_facialLibrary = require('./routes/route_facialLibrary');
var route_imageReminder = require('./routes/route_imageReminder');
var route_patient = require('./routes/route_patient');
var route_geoFence = require('./routes/route_geoFence');
var route_locationLibrary = require('./routes/route_locationLibrary');
var route_sendNotifications = require('./routes/route_sendNotifications');
var route_notes = require('./routes/route_notes');
var route_sensorInfo = require('./routes/route_sensorInfo');
var route_smartReminder = require('./routes/route_smartReminder');


var fitbitAuthenticate = passport.authenticate('fitbit', {
  session: false
});

app.get('/auth/fitbit', fitbitAuthenticate);
app.get('/auth/fitbit/callback', fitbitAuthenticate , function(req, res, next) {
  console.log("success");
  console.log(req.user);
  res.redirect('https://alzheimers-server.herokuapp.com/#/settings?id='+req.user.linkToPatient);
});

// routes containing passport.authenticate will require authentication before accessing
app.use('/auth', authenticate_route);
app.use('/contactDetails', passport.authenticate('jwt', { session: false }), route_contactDetails);
app.use('/caregivers', passport.authenticate('jwt', { session: false }), route_caregivers);
app.use('/fcm', passport.authenticate('jwt', { session: false }), route_fcm);
app.use('/circle', route_circle);
app.use('/facialLibrary', passport.authenticate('jwt', { session: false }), route_facialLibrary);
app.use('/imageReminder', passport.authenticate('jwt', { session: false }), route_imageReminder);
app.use('/patients', passport.authenticate('jwt', { session: false }), route_patient);
app.use('/geoFence', passport.authenticate('jwt', { session: false }), route_geoFence);
app.use('/location', passport.authenticate('jwt', { session: false }), route_locationLibrary);
app.use('/fcmNotification', passport.authenticate('jwt', { session: false }), route_sendNotifications);
app.use('/notes',passport.authenticate('jwt', { session: false }), route_notes);
app.use('/sensorInfo',passport.authenticate('jwt', { session: false }), route_sensorInfo);
app.use('/smartReminder',passport.authenticate('jwt', { session: false }), route_smartReminder);

//this is an example of unauthenticated route
app.get('/sample', function(req, res) {
  res.send({"body":JSON.stringify('It worked! ')});
});

// Protect dashboard route with JWT
/*app.get('/dashboard'), function(req, res) {
  res.send('It worked! User id is: ' + req.user.email + '.');
});*/



// development error handler
// will print stacktrace
if (app.get('env') === 'development') {

  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: err
    });
  });

}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    console.log(err.stack);
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


app.listen(port);
console.log('The magic happens on port ' + port);
