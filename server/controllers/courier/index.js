const Order = require("../../models/order");
const router = require("express").Router();

router.get("/", async (req, res) => {

    let courier_orders = await Order.findAll({where: {courier_id: req.user.getDataValue('id')}});

    res.render("courier/dashboard.ejs", { title: "Courier - Home", orders: courier_orders})
});

router.post("/", async (req, res) => {
    Order.update({status: 'DELIVERED'}, {where: {id: req.body.selectedOrder}}).then(() => {
        res.redirect(req.originalUrl);
    }).catch((error) => {
        res.send(`Caught error while updating delivery status: ${error}`)
    });
});

router.use("/scan", require("./scanner.js"));

module.exports = router;