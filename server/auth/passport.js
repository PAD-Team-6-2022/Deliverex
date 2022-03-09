const { compareSync } = require("bcrypt");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("../models/user");

passport.use(
  new LocalStrategy((username, password, cb) => {
    const errMessage = "Incorrect username or password";

    User.findOne({ where: { username }, attributes: ["password"] })
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

passport.serializeUser((user, cb) => {
  process.nextTick(() => {
    cb(null, { id: user.id, username: user.username });
  });
});

passport.deserializeUser((user, cb) => {
  process.nextTick(() => {
    cb(null, user);
  });
});

module.exports = passport;
