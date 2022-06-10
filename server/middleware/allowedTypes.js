/**
 * Adds check to see if user has the correct role
 *
 * @param {Array<String>} allowedTypes Roles that are allowed to acces this page
 * @returns next or redirect to /dashboard
 */
const allowedTypes = (allowedTypes) => (req, res, next) => {
    if (allowedTypes.includes(req.user.role)) {
        return next();
    } else {
        return res.redirect("/dashboard"); 
    }
};

module.exports = allowedTypes;
