const router = require("express").Router();
const Order = require("../../models/order");

router.get("/", (req, res) => {
  res.redirect("/dashboard/overview");
});

router.get("/overview", async (req, res) => {
  // Calculate limit. Cannot be anything other than 25, 50 or 100
  let limit = Number(req.query.limit);
  limit = limit === 25 || limit === 50 || limit === 100 ? limit : 25;

  // Get the page and calculate the offset
  const page = Number(req.query.page);
  const offset = limit * (page - 1);

  // Get the orders with the calculated offset and limit for pagination
  const orders = await Order.findAll({ offset, limit });

  // Render the page, pass on the order array
  res.render("dashboard/overview", {
    title: "Overzicht - Dashboard",
    orders,
  });
});

router.use("/orders", require("./orders"));

module.exports = router;
