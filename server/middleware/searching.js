/**
 * Taking out the search query and adding it to the request object
 * for easy access, and using a default string if nothing is searched.
 */
const searching = (req, res, next) => {
  const search = req.query.search || "";

  req.search = search;

  next();
};

module.exports = searching;
