const router = require("express").Router();

// Destruct the controller functions
const {
  create,
  getAll,
  update,
  getByUsername,
  remove
} = require("../../controllers/api/users");

// Map the controller functions to a specific route
router.post("/", create);
router.get("/", getAll);
router.get("/:username", getByUsername);
router.patch("/:id", update);
router.delete("/:id", remove);

module.exports = router;