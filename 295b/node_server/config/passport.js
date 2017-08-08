var jwt = require('jsonwebtoken');
var passport = require("passport");
var passportJWT = require("passport-jwt");

var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;

var User = require('../models/user');
var fitbituser = require('../models/fitbituser');

var secrets = require('./secrets.js');

var FitbitStrategy = require( 'passport-fitbit-oauth2' ).FitbitOAuth2Strategy;;

// Setup work and export for the JWT passport strategy
module.exports = function(passport) {  
  var opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
  opts.secretOrKey = secrets.secret;
  passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    User.findOne({_id: jwt_payload._id}, function(err, user) {
      if (err) {
        return done(err, false);
      }
      if (user) {
        done(null, user);
      } else {
        done(null, false);
      }
    });
  }));


  passport.use(new FitbitStrategy({
    clientID:     secrets.fitbit_client_id,
    clientSecret: secrets.fitbit_client_secret,
    scope: ['activity','heartrate','location','profile','sleep'],
    callbackURL: "https://alzheimers-server.herokuapp.com/auth/fitbit/callback"
  },
  function(accessToken, refreshToken, profile, done) {

    fitbituser.findOne({fitbitId:  profile.id}, function(err, user) {
      if (err) {
        return done(err, false);
      }
      if (user) {
        if(user.refreshToken != refreshToken){
          //token refresh function
          console.log("refresh token for fitbit in passport");
          fitbituser.findOneAndUpdate({fitbitId:  profile.id},{$set:{"accessToken":accessToken, "refreshToken":refreshToken}},{new: true}, function(err,updateduser){
            done(null, updateduser);
          });
        }
        done(null, user);
      } else {
        var new_fitbituser = new fitbituser({
          "fitbitId": profile.id,
          "accessToken": accessToken,
          "refreshToken": refreshToken
        });
        new_fitbituser.save(function(err, new_fitbituser){
          return done(err, new_fitbituser);
          });
      }
    });

    }
  ));
  
};