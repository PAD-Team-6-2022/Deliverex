const router = require("express").Router();
const Order = require("../../models/order");

const useragent = require('express-useragent');
const auth = require("../../middleware/auth");

router.post("/", auth(true), (req, res) => {

    console.log('test');
    //console.log(req.user);

    /*
    Order.update({courier_id: req.user.getDataValue('id')}, {where: {id: id}}).then((res) => {
        console.log("Succes!")
    }).catch((error) => {
        console.error(`Could not assign order to courier. Error message: ${error}`)
    });*/
});

router.get("/:id", async (req, res) => {

    //Update de status van de order naar 'in transit'

    const {id} = req.params; //req.body.decodedText;

    await Order.findByPk(id).then((order) => {
        res.json({order: order});
    }).catch((error) => {
        console.error(`Could not retrieve order by ID ${id}. Errormessage: ${error}`);
    });
})

router.get("/", useragent.express(), async (req, res) => {
    if(req.useragent.isMobile)
        res.render("courier/scanner.ejs", {title: "Courier - Scanner"});
    else
        res.send("This feature is only available on mobile devices."); //<-- update later to something better-looking
});

module.exports = router;