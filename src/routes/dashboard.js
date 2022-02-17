const router = require("express").Router();

const {
  index
} = require("../controllers/dashboard");

router.get("/", index);

module.exports = router;