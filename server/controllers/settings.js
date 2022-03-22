const router = require("express").Router();

/**
 * Render the package size page
 */
router.get("/settings/sizes", (req, res) => {
    res.render("/settings/package_size", {title: "Package sizes"})
});

module.exports = router;
