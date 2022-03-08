const router = require("express").Router();

// Destruct the controller functions
const { destroy } = require("../../controllers/api/orders");

// Map the controller functions to a specific route
router.delete("/:id", destroy);

module.exports = router;
