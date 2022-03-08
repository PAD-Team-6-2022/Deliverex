const router = require("express").Router();

// Destruct the controller functions
const { index } = require("../controllers/setup");

// Map the controller functions to a specific route
router.get("/", index);

module.exports = router;
