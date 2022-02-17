const router = require("express").Router();
const trackerController = require("../controllers/tracker");

router.get("/", trackerController.index);

module.exports = router;