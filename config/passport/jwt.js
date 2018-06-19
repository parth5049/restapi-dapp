var JwtStrategy = require('passport-jwt').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User'); 
// load up the user model
//var User = require('../app/models/user');
const config = require('./config');
 
module.exports = function(passport) {
  var opts = {};
  opts.secretOrKey = config.secret;
  passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    User.findOne({id: jwt_payload.id}, function(err, user) {
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
};