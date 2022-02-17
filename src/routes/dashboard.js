const router = require("express").Router();
const DashboardController = require("../controllers/dashboard");

router.get("/", DashboardController.index);

module.exports = router;