const router = require("express").Router();

// Destruct the controller functions
const {
  login
} = require("../../controllers/api/auth");

// Map the controller functions to a specific route
router.post("/login", login);

module.exports = router;