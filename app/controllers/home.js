var mongoose = require('mongoose');
var User = mongoose.model('User');
// pass passport for configuration
var passport = require('passport');
//var jwt = require('jwt-simple');
var config = require('../../config');
/*!
 * Module dependencies.
 */

exports.index = function (req, res) {
  res.render('home/index', {
    title: 'REST APIs'
  });
};


/* exports.registerUser = function(req, res) {
	if (!req.body.name || !req.body.password) {
	  res.json({success: false, msg: 'Please pass name and password.'});
	} else {
	  var newUser = new User({
	    name: req.body.name,
	    password: req.body.password
	  });
	  // save the user
	  newUser.save(function(err) {
	    if (err) {
	      return res.json({success: false, msg: 'Username already exists.'});
	    }
	    res.json({success: true, msg: 'Successful created new user.'});
	  });
	}
};

exports.authenticate = function(req, res) {
  User.findOne({
    name: req.body.name
  }, function(err, user) {
    if (err) throw err;
 
    if (!user) {
      res.send({success: false, msg: 'Authentication failed. User not found.'});
    } else {
      // check if password matches
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          // if user is found and password is right create a token
          var token = jwt.encode(user, config.secret);
          // return the information including token as JSON
          res.json({success: true, token: 'JWT ' + token});
        } else {
          res.send({success: false, msg: 'Authentication failed. Wrong password.'});
        }
      });
    }
  }); 
};*/