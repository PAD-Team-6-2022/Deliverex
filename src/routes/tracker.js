const router = require("express").Router();
const TrackerController = require("../controllers/tracker");

router.get("/", TrackerController.index);

module.exports = router;