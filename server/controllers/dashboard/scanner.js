const router = require("express").Router();
const useragent = require('express-useragent');
const auth = require("../../middleware/auth");

/**
 * Defines the server's response to the no-parameter GET request of the
 * scanning page. The server will use the 'express-useragent' module to check
 * as to whether the user is currently on a mobile device or not. If not, the
 * server will send a message informing the user that his platform is incompatible.
 */
router.get("/", auth(true), useragent.express(), async (req, res) => {
    res.render("dashboard/courier/scanner", {title: "Courier - Scanner"});
    // if(req.useragent.isMobile)
    //     res.render("dashboard/courier/scanner", {title: "Courier - Scanner"});
    // else
    //     res.send("This feature is only available on mobile devices."); //<-- update later to something better-looking
});

module.exports = router;