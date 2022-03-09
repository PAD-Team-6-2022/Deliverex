const auth = require("../../middleware/auth");

const router = require("express").Router();

router.get("/create", auth, (req, res) => {
  res.render("dashboard/orders/create", { title: "Create order" });
});

module.exports = router;
