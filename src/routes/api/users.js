const router = require("express").Router();
const UsersController = require("../../controllers/api/users");

router.post("/", UsersController.create);
router.get("/", UsersController.getAll);
router.get("/:id", UsersController.getById);
router.patch("/:id", UsersController.update);
router.delete("/:id", UsersController.delete);

module.exports = router;