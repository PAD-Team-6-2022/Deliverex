const router = require("express").Router();

// Destruct the controller functions
const {
  index,
  admin,
  database,
  personalisation,
  completed,
} = require("../controllers/setup");

// Map the controller functions to a specific route
router.get("/", index);
router.get("/admin", admin);
router.get("/database", database);
router.get("/personalisation", personalisation);
router.get("/completed", completed);

module.exports = router;
