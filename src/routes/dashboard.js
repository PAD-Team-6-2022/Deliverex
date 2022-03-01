const router = require("express").Router();

// Destruct the controller functions
const {
  index
} = require("../controllers/dashboard");

// Map the controller functions to a specific route
router.get("/", index);

module.exports = router;