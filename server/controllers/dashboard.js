const { Response, Request } = require("express");
const Order = require("../models/order");

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
  index: async (req, res) => {
    const orders = await Order.findAll();
    res.render("dashboard/overview", { title: "Overzicht - Dashboard" });
  },
  /**
   * Render the dashboard's create order page. (views/pages/dashboard/create_order.ejs)
   *
   * @param {Request} req the request object
   * @param {Response} res the response object.
   */
  createOrder: (req, res) => {
    res.render("dashboard/orders/create", { title: "Create order" });
  },
};

module.exports = DashboardController;
