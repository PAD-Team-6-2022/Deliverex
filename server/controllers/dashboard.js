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
    // const orders = await Order.findAll();
    const orders = [
      {
        code: '1938031',
        email: 'pete@mail.com',
        state: 'Deliverd',
        date: '07-03-2022'
      },
      {
        code: '18751012',
        email: 'dave@mail.com',
        state: 'Send',
        date: '31-02-2022'
      },
      {
        code: '41515105',
        email: 'mike@mail.com',
        state: 'Deliverd',
        date: '07-03-2022'
      },
      {
        code: '17571818',
        email: 'jim@mail.com',
        state: 'Failed',
        date: '31-02-2022'
      },
      {
        code: '15356167',
        email: 'erick@mail.com',
        state: 'Deliverd',
        date: '15-05-2021'
      },
      {
        code: '24627789',
        email: 'richard@mail.com',
        state: 'Deliverd',
        date: '02-05-2022'
      }
    ];
    res.render("dashboard/overview", { title: "Overzicht - Dashboard", orders: orders });
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
