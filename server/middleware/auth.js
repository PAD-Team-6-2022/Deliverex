const auth = (predicate) => (req, res, next) => {
  const isAuthenticated = req.isAuthenticated();

  if (predicate) {
    return isAuthenticated ? next() : res.redirect("/dashboard/signin");
  } else {
    return isAuthenticated ? res.redirect("/dashboard") : next();
  }
};

module.exports = auth;
