const { compareSync } = require("bcrypt");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("../models/user");

// Configure Passport to use the LocalStrategy
passport.use(
  new LocalStrategy((username, password, cb) => {
    const errMessage = "Incorrect username or password";

    User.findOne({ where: { username }, attributes: ["id", "password"] })
      .then((user) => {
        if (!user) return cb(null, false, { message: errMessage });

        if (compareSync(password, user.password)) {
          return cb(null, user);
        } else {
          return cb(null, false, {
            message: errMessage,
          });
        }
      })
      .catch((err) => {
        return cb(err);
      });
  })
);

// Configure Passport to serialize the user
passport.serializeUser((user, callback) => {
  callback(null, user.id);
});

// Configure Passport to deserialize the user
passport.deserializeUser((id, callback) => {
  User.findByPk(id)
    .then((user) => callback(null, user))
    .catch((err) => callback(err));
});

module.exports = passport;
