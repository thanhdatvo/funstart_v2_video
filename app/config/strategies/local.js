var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    User = require('mongoose').model('User');
module.exports = function() {
    passport.use(new LocalStrategy(function(email, password, done) {
        console.log('chui vo day');
        User.findOne({
            email: email
        }, function(err, user) {
           console.log(err);
           console.log(user);
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false);
            }
             // authenticate
            if (!user.authenticate(password)) {
                return done(null, false);
            }
            console.log(err + "USER " + JSON.stringify(user));
            return done(null, user);
        });
    }));
};