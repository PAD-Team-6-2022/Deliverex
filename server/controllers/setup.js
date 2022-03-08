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
   * Render the dashboard's setup page. (views/pages/dashboard/setup.ejs)
   *
   * @param {Request} req  the request object.
   * @param {Response} res the response object.
   */
  index: (req, res) => {
    res.render("setup", { title: "Setup - Dashboard" });
  },
};

module.exports = SetupController;
