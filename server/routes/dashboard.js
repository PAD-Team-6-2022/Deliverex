const router = require("express").Router();

// Destruct the controller functions
const { index, createOrder } = require("../controllers/dashboard");

// Map the controller functions to a specific route
router.get("/", index);
router.get("/orders/create", createOrder);

module.exports = router;
