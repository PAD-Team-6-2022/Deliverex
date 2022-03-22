const router = require("express").Router();
const Order = require("../models/order");

/**
 * Render the homepage
 */
router.get("/", (req, res) => {
  res.render("home", {title: "Homepage"})
});



/**
 * Render tracker page for order with given id
 */
router.get("/track/:id", async (req, res) => {
  const { id } = req.params;
  const order = await Order.findByPk(id);

  if (!order) {
    res.redirect("/");
    return;
  }

  res.render("tracker", { title: "Track & Trace", order });
});

module.exports = router;
