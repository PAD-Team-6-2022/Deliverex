const router = require("express").Router();
const Order = require("../../models/order");

router.get("/", (req, res) => {
    res.redirect("/dashboard/overview");
});

router.get("/overview", async (req, res) => {
    const limit = Number(req.query.limit || 25)
    let orders;

    if( limit === 25 || limit === 50 || limit === 100) {
        const page = req.query.page || 1
        orders = await Order.findAll({offset: (page - 1) * limit, limit: limit});
    } else {
        orders = await Order.findAll({offset: 0, limit: limit});
        console.log("Wrong limit!")
    }

    res.render("dashboard/overview", {
        title: "Overzicht - Dashboard",
        orders,
    });
});

router.use("/orders", require("./orders"));

module.exports = router;
