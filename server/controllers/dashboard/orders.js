const router = require("express").Router();

router.get("/create", (req, res) => {
  res.render("dashboard/orders/create", { title: "Create order" });
});

module.exports = router;
