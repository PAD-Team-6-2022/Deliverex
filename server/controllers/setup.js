const { Response, Request } = require("express");

/**
 * The controller used to handle
 * all the tracker frontend logic.
 *
 * @author Team 6
 * @since 1.0
 */
const SetupController = {
  /**
   * Redirect to the first stage (/admin)
   *
   * @param {Request} req
   * @param {Response} res
   */
  index: (req, res) => {
    res.redirect("/setup/admin");
  },
  /**
   * Render the dashboard's setup page. (views/pages/dashboard/setup.ejs)
   *
   * @param {Request} req  the request object.
   * @param {Response} res the response object.
   */
  admin: (req, res) => {
    res.render("setup/admin", { title: "Administrator - Setup" });
  },
  database: (req, res) => {
    res.render("setup/database", { title: "Database - Setup" });
  },
  personalisation: (req, res) => {
    res.render("setup/personalisation", { title: "Personalisatie - Setup" });
  },
  completed: (req, res) => {
    res.render("setup/completed", { title: "Compleet - Setup" });
  },
};

module.exports = SetupController;
