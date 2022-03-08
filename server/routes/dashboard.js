const router = require("express").Router();

// Destruct the controller functions
const {
  index,
  setup
} = require("../controllers/dashboard");

// Map the controller functions to a specific route
router.get("/", index);
router.get("/setup", setup)

module.exports = router;