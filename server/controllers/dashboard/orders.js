const auth = require("../../middleware/auth");
const { Order, Format } = require("../../models");
const convert = require("convert-units");

const router = require("express").Router();

router.get("/", auth(true), (req, res) => {
  res.render("dashboard/orders/list", { title: "Orders - Dashboard" });
});

router.get("/editFormat/:id", auth(true), async (req, res) => {

  const format = await Format.findByPk(req.params.id);

  res.render("dashboard/orders/editFormat", { title: "Edit Page- Formats",
    format });

});

router.get("/create", auth(true), async (req, res) => {

  const formats = await Format.findAll({
    where: { userId: req.user.id }
  });

  res.render("dashboard/orders/create", { title: "Create order - Dashboard",
  formats });

});

router.get("/:id/edit", auth(true), async (req, res) => {
  const { id } = req.params;
  const order = await Order.findByPk(id);

  const formats = await Format.findAll({
    where: { userId: req.user.id }
  });

  if (!order) {
    res.redirect("/dashboard/overview");
    return;
  }

  res.render("dashboard/orders/edit", {
    title: "Edit order - Dashboard",
    order,
    formats
  });
});

router.get("/:id", auth(true), async (req, res) => {
  const { id } = req.params;
  const order = await Order.findByPk(id, { include: Format });

  // if no order is found redirect it to the dashboard overview
  if (!order) {
    res.redirect("/dashboard/overview");
    return;
  }

  // covert the weight to the best value "kg" or "g"
  const convertedWeight = convert(order.weight).from("g").toBest();
  order.weight = `${Math.round(convertedWeight.val)} ${convertedWeight.unit}`;

  res.render("dashboard/orders/detail", {
    title: `Order #${id} - Dashboard`,
    id,
    order,
  });
});

module.exports = router;
