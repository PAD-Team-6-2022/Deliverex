const searching = (req, res, next) => {
  const search = req.query.search || "";

  req.search = search;

  next();
};

module.exports = searching;
