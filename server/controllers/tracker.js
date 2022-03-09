const router = require("express").Router();

router.get("/", (req, res) => {
  res.render("tracker", { title: "Track & Trace" });
});

module.exports = router;
