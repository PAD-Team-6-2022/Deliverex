const router = require("express").Router();
const Order = require("../../models/order");
const passport = require("../../auth/passport");
const auth = require("../../middleware/auth");
const pagination = require("../../middleware/pagination");
const ordering = require("../../middleware/ordering");
const convert = require("convert-units");

router.get("/", auth(true), (req, res) => {
  res.redirect("/dashboard/overview");
});

router.get(
  "/overview",
  auth(true),
  pagination([25, 50, 100]),
  ordering("id", "asc"),
  async (req, res) => {
    // Get the orders with the calculated offset, limit for pagination and details about the sorting order
    const orders = await Order.findAll({
      offset: req.offset,
      limit: req.limit,
      order: [[req.sort, req.order]],
    });

    //converteer het gewicht van elke order naar de
    orders.forEach((order) => {
      let value = convert(order.weight).from("g").toBest();
      order.weight = `${Math.round(value.val)} ${value.unit}`;
    });

    // Render the page, pass on the order array
    res.render("dashboard/overview", {
      title: "Overzicht - Dashboard",
      orders,
      sort: req.sort,
      order: req.order,
      limit: req.limit,
    });
  }
);

router.get("/signin", auth(false), (req, res) => {
  res.render("dashboard/signin", {
    title: "Sign In - Dashboard",
  });
});

// Authentication via Passport.js
router.post(
  "/signin",
  auth(false),
  passport.authenticate("local", {
    failureRedirect: "/dashboard/signin",
  }),
  (req, res) => {
    // Saving the session before redirecting,
    // otherwise req#isAuthenticated() returns
    // null. Not sure why that is, but it has
    // been an issue since 2015.
    req.session.save(() => {
      res.redirect("/dashboard");
    });
  }
);

router.get("/signout", auth(true), (req, res) => {
  req.logout();
  res.redirect("/");
});

router.use("/orders", require("./orders"));

module.exports = router;
