const router = require("express").Router();

router.get("/", (req, res) => {
  res.redirect("/setup/admin");
});

router.get("/database", (req, res) => {
  res.render("setup/database", { title: "Database - Setup" });
});

router.get("/admin", (req, res) => {
  res.render("setup/admin", { title: "Administrator - Setup" });
});

router.get("/personalisation", (req, res) => {
  res.render("setup/personalisation", { title: "Personalisatie - Setup" });
});

router.get("/completed", (req, res) => {
  res.render("setup/completed", { title: "Compleet - Setup" });
});

module.exports = router;
