const router = require("express").Router();

// Destruct the controller functions
const {
  index
} = require("../controllers/tracker");

// Map the controller functions to a specific route
router.get("/", index);

module.exports = router;