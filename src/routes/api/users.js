const router = require("express").Router();
const userController = require("../../controllers/api/users");

router.get("/", userController.get);

module.exports = router;