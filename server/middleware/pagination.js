/**
 * Used for pagination
 * 
 * @param {*} limits increments
 */
const pagination = (limits) => (req, res, next) => {
  if (!limits || limits.length === 0)
    throw new Error("Pagination limits not set");

  // Calculate limit
  let limit = Number(req.query.limit);
  limit = limits.includes(limit) ? limit : limits[0];

  // Get the page and calculate the offset
  const page = Number(req.query.page) || 1;
  const offset = limit * (page - 1);

  req.limit = limit;
  req.offset = offset;
  req.page = page;

  next();
};

module.exports = pagination;
