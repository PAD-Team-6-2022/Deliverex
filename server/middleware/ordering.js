/**
 * Middleware for ordering model results.
 * 
 * @param {*} defaultSort asc, or desc.
 * @param {*} defaultOrder default order
 * @param {*} allowedSorts columns allowed for sorting
 */
const ordering =
    (defaultSort, defaultOrder, allowedSorts = [defaultSort]) =>
    (req, res, next) => {
        // Make sure the sorting is allowed
        const sort = allowedSorts.includes(req.query.sort)
            ? req.query.sort
            : defaultSort;

        let order = req.query.order || defaultOrder;

        // Default to asc if invalid order value
        if (order !== 'asc' && order !== 'desc') order = 'asc';

        req.sort = sort;
        req.order = order;

        next();
    };

module.exports = ordering;
