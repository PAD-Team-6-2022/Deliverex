const DashboardController = {
  index: (req, res) => {
    res.render("dashboard", { title: "Dashboard" });
  }
}

module.exports = DashboardController;