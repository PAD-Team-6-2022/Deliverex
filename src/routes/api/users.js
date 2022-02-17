const router = require("express").Router();

const {
  create,
  getAll,
  getById,
  update,
  remove
} = require("../../controllers/api/users");

router.post("/", create);
router.get("/", getAll);
router.get("/:id", getById);
router.patch("/:id", update);
router.delete("/:id", remove);

module.exports = router;