const router = require("express").Router();
const Order = require("../../models/order");
const passport = require("../../auth/passport");
const auth = require("../../middleware/auth");
const pagination = require("../../middleware/pagination");

router.get("/", auth, (req, res) => {
  res.redirect("/dashboard/overview");
});

router.get("/overview", auth, pagination([25, 50, 100]), async (req, res) => {

  let filterOptions = [];
  if(req.query.filteredId)
    filterOptions.push(["id", req.query.filteredId]);

  if(req.query.filteredEmail)
    filterOptions.push("email", req.query.filteredEmail)

  if(req.query.filteredState)
    filterOptions.push(["state", req.query.filteredState]);

  if(req.query.filteredDate)
    filterOptions.push(["created_at", req.query.filteredDate]);

  // Get the orders with the calculated offset and limit for pagination
  const orders = await Order.findAll({ offset: req.offset, limit: req.limit, order: filterOptions});

  // Render the page, pass on the order array
  res.render("dashboard/overview", {
    title: "Overzicht - Dashboard",
    orders,
    queryParams: req.query
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
