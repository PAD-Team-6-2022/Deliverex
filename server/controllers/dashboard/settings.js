const router = require("express").Router();

/**
 * Render the package size page
 */
router.get("/sizes", (req, res) => {
    res.render("dashboard/settings/package_size", {title: "Package sizes"})
});

module.exports = router;
