const router = require("express").Router();

router.post("/signin", (req, res) => {
  const redirect = req.query.redirect;

  if (redirect) {
    res.redirect(redirect);
  } else {
    res.json({
      message: "Couldn't sign in",
    });
  }
});

router.use("/orders", require("./orders"));
router.use("/users", require("./users"));

module.exports = router;
