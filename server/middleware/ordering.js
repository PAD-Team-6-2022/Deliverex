const ordering = (defaultSort, defaultOrder) => (req, res, next) => {
  const sort = req.query.sort || defaultSort;
  let order = req.query.order || defaultOrder;

  // Default to asc if invalid order value
  if (order !== "asc" || order !== "desc") order = "asc";

  req.sort = sort;
  req.order = order;

  next();
};

module.exports = ordering;
