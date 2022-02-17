const router = require("express").Router();
const dashboardController = require("../controllers/dashboard");

router.get("/", dashboardController.index);

module.exports = router;