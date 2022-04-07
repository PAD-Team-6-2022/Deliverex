const Order = require("../../models/order");
const router = require("express").Router();
const auth = require("../../middleware/auth");

/**
 * Defines the server's response to the no-parameter GET request of the
 * courier dashboard page. The server will render the dashboard page, and
 *  search for all the orders associated with this courier so that those
 *  may be loaded on the dashboard.
 */
router.get("/", auth(true), async (req, res) => {
    let courier_orders = await Order.findAll({where: {courier_id: req.user.getDataValue('id')}});
    res.render("courier/dashboard.ejs", { title: "Courier - Home", orders: courier_orders})
});

/**
 * Updates the status of an order from 'TRANSIT' to 'DELIVERED' and
 * reloads the page.
 */
router.post("/", async (req, res) => {
    Order.update({status: 'DELIVERED'}, {where: {id: req.body.selectedOrder}}).then(() => {
        res.redirect(req.originalUrl);
    }).catch((error) => {
        res.sendStatus(500).send(`Caught error while updating delivery status: ${error}`);
    });
});

router.use("/scan", require("./scanner.js"));

module.exports = router;