const auth = (req, res, next) => {
  return req.isAuthenticated() ? next() : res.redirect("/dashboard/signin");
};

module.exports = auth;
