const router = require("express").Router();
const Order = require("../../models/order");

router.get("/", (req, res) => {
  res.redirect("/dashboard/overview");
});

router.get("/overview", async (req, res) => {
  const limit = Number(req.query.limit) || 25;
  const page = Number(req.query.page) || 1;
  const offset =
    limit === 25 || limit === 50 || limit === 100 ? (page - 1) * limit : 0;
  const orders = await Order.findAll({ offset, limit });

  res.render("dashboard/overview", {
    title: "Overzicht - Dashboard",
    orders,
  });
});

router.use("/orders", require("./orders"));

module.exports = router;
