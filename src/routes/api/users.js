const router = require("express").Router();

// Destruct the controller functions
const {
  create,
  findOne,
  findAll,
  destroy
} = require("../../controllers/api/users");

// Map the controller functions to a specific route
router.post("/", create);
router.get("/:id", findOne);
router.get("/", findAll);
router.delete("/:id", destroy);

module.exports = router;