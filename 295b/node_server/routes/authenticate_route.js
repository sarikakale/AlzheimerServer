
var express = require('express');
var router = express.Router();
var User = require('../models/user');
var secrets = require('../config/secrets.js');
var jwt = require('jsonwebtoken');
 
//register a new user
router.post('/register',function(req, res, next){
    if(!req.body.email || !req.body.password)
    {
        res.status(400).json({ success: false, message: 'Please enter email and password.' });
    }
    else
    {
        var newUser = new User();

        // set the user's local credentials
        newUser.email    = req.body.email;
        newUser.password = newUser.generateHash(req.body.password);
        newUser.role = req.body.role;

        // Attempt to save the user
        //returning doc for some temp fix, doc should not be returned otherwise
        newUser.save(function(err, doc) {
          if (err) {
            return res.status(409).json({ success: false, message: 'That email address already exists.'});
          }
          res.status(201).json({ success: true, message: 'Successfully created new user.',userId: doc._id });
        });
    }
})

// authenticate a user and provide token for further requests from the API
router.post('/authenticate',function(req, res, next){
 User.findOne({
    email: req.body.email
  }, function(err, user) {
    if (err) throw err;

    if (!user) {
      res.status(401).send({ success: false, message: 'Authentication failed. User not found.' });
    } else {
      // Check if password matches
        if (user.validPassword(req.body.password)) {
          // Create token if the password matched and no error was thrown
          userObj = {};
          userObj['_id'] = user._id;
          userObj['email'] = user.email;
          userObj['role'] = user.role;

          var token = jwt.sign(userObj, secrets.secret, {
            expiresIn: 604800 // in seconds -> 7 days
          });
          res.status(200).json({ success: true, token: 'JWT ' + token });
        } else {
          res.status(401).send({ success: false, message: 'Authentication failed. Passwords did not match.' });
        }
      }
  });
})


module.exports = router;
