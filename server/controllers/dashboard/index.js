const router = require("express").Router();
const Order = require("../../models/order");
const passport = require("../../auth/passport");
const auth = require("../../middleware/auth");
const pagination = require("../../middleware/pagination");
const ordering = require("../../middleware/ordering");

router.get("/", auth, (req, res) => {
  res.redirect("/dashboard/overview");
});

router.get("/overview", auth, pagination([25, 50, 100]), ordering, async (req, res) => {

  // Get the orders with the calculated offset, limit for pagination and details about the sorting order
  const orders = await Order.findAll({ offset: req.offset, limit: req.limit, order: [[req.col, req.order]]});

  // Render the page, pass on the order array
  res.render("dashboard/overview", {
    title: "Overzicht - Dashboard",
    orders,
    column: req.col,
    orderingDirection: req.order
  });
});

router.get("/signin", (req, res) => {
  res.render("dashboard/signin", {
    title: "Sign In - Dashboard",
  });
});

// Authentication via Passport.js
router.post(
  "/signin",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/dashboard/signin",
  })
);

router.post("/signout", auth, (req, res) => {
  req.logout();
  res.redirect("/");
});

router.use("/orders", require("./orders"));

module.exports = router;
