const { Response, Request } = require("express");
const Order = require("../../models/order");

/**
 * The controller used to handle
 * all the orders api logic.
 *
 * @author Team 6
 * @since 1.0
 */
const OrdersController = {
  /**
   *
   * @param {Request} req
   * @param {Response} res
   */
  destroy: async (req, res) => {
    Order.destroy({ where: { id: req.params.id } })
      .then(() => {
        res.status(200).json({
          message: "Successfully deleted order",
        });
      })
      .catch((err) => {
        res.status(500).json({
          message: `Something went wrong while trying to delete the order: ${err}`,
        });
      });
  },
};

module.exports = OrdersController;
