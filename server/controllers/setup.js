const router = require("express").Router();

router.get("/", (req, res) => {
  res.redirect("/setup/database");
});

router.get("/:stage", (req, res) => {
  const stages = [
    { name: "database" },
    { name: "admin" },
    { name: "design" },
    { name: "done" },
  ].map((stage) => ({ active: req.params.stage === stage.name, ...stage }));

  res.render("setup", {
    title: "Setup",
    stages,
  });
});

module.exports = router;
