const router = require("express").Router();

const {
  index
} = require("../controllers/tracker");

router.get("/", index);

module.exports = router;