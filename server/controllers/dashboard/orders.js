const auth = require("../../middleware/auth");
const Order = require("../../models/order");
const convert = require("convert-units");

const router = require("express").Router();

router.get("/create", auth(true), (req, res) => {
  res.render("dashboard/orders/create", { title: "Create order" });
});

router.get("/edit/:id", auth(true), async (req, res) => {
  const { id } = req.params;
  const order = await Order.findByPk(id);

  if (!order) {
    res.redirect("/dashboard/overview");
    return;
  }

  res.render("dashboard/orders/edit", { title: "Edit order", order});
});

router.get("/:id", auth(true), async (req, res) => {
  const { id } = req.params;
  const order = await Order.findByPk(id);

  // if no order is found redirect it to the dashboard overview
  if (!order) {
    res.redirect("/dashboard/overview");
    return;
  }

  // covert the weight to the best value "kg" or "g"
  const convertedWeight = convert(order.weight).from("g").toBest();
  order.weight = `${Math.round(convertedWeight.val)} ${convertedWeight.unit}`;

  res.render("dashboard/orders/detail", { title: "Order detail", id, order });
});

module.exports = router;
