const { Response, Request } = require("express");

/**
 * The controller used to handle
 * all the dashboard frontend logic.
 * 
 * @author Team 6
 * @since 1.0
 */
const DashboardController = {
  /**
   * Render the dashboard's index page. (views/pages/dashboard.ejs)
   * 
   * @param {Request} req the request object.
   * @param {Response} res the response object.
   */
  index: (req, res) => {
    res.render("dashboard", { title: "Dashboard" });
  }
}

module.exports = DashboardController;