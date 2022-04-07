const router = require("express").Router();
const Order = require("../../models/order");
const useragent = require('express-useragent');
const auth = require("../../middleware/auth");

/**
 * Updates the 'courier_id' attribute of an order to the given ID of the courier.
 * In case the order could not be found or another error was caught, the server
 * will respond with the appropiate error messages.
 */
router.put("/", auth(true), (req, res) => {
    Order.findByPk(req.body.id).then((order) => {
            Order.update({courier_id: req.user.id, status: 'TRANSIT'}, {where: {id: req.body.id}}).then((data) => {
                res.sendStatus(200);
            }).catch((error) => {
                console.error(`Could not assign order to courier. Error message: ${error}`)
                res.sendStatus(500);
            });
    }).catch((error) => {
        console.error(`Could not find order with ID ${req.body.id}. Error: ${error}`);
        res.sendStatus(404);
    })
});

/**
 * Retrieves the order associated with a given ID. Since it is assumed that
 * request will come from the scanning page, the server will check whether
 * this order has already been taken by another courier and/or whether it is
 * in it's READY state so that it may be transported.
 */
router.get("/:id", async (req, res) => {
    const {id} = req.params;

    await Order.findByPk(id).then((order) => {
        res.json({order: order, isAlreadyAssigned:
                (order.getDataValue('courier_id') !== null) ||
                (order.getDataValue('status') !== 'READY')});
    }).catch((error) => {
        console.error(`Could not find order with ID ${id}. Error: ${error}`);
        res.sendStatus(404);
    });
});

/**
 * Defines the server's response to the no-parameter GET request of the
 * scanning page. The server will use the 'express-useragent' module to check
 * as to whether the user is currently on a mobile device or not. If not, the
 * server will send a message informing the user that his platform is incompatible.
 */
router.get("/", auth(true), useragent.express(), async (req, res) => {
    if(req.useragent.isMobile)
        res.render("courier/scanner.ejs", {title: "Courier - Scanner"});
    else
        res.send("This feature is only available on mobile devices."); //<-- update later to something better-looking
});

module.exports = router;