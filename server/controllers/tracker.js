const { Response, Request } = require("express");

/**
 * The controller used to handle
 * all the tracker frontend logic.
 * 
 * @author Team 6
 * @since 1.0
 */
const TrackerController = {
  /**
   * Render the tracker's index page. (views/pages/tracker.ejs)
   * 
   * @param {Request} req the request object
   * @param {Response} res the response object
   */
  index: (req, res) => {
    res.render("tracker", { title: "Track & Trace" });
  }
}

module.exports = TrackerController;