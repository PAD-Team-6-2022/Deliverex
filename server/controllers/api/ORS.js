const router = require("express").Router();

const fetch = require('node-fetch');

const Order = require("../../models/order");
const auth = require("../../middleware/auth");

const API_KEY = process.env.ORS_API_KEY;

router.get("/", auth(true), (req, res) => {

    console.log('ORS test');

    Order.findAll({where: {courier_id: req.user.id}}
    ).then((orders) => {

        let coordinateValues = "";
        orders.forEach((order) => {
            let long = order.getDataValue('coordinates').coordinates[0];
            let lat = order.getDataValue('coordinates').coordinates[1];
            coordinateValues += `[${long},${lat}]`;
        })
        coordinateValues = coordinateValues.replaceAll("][", "],[");

        console.log(coordinateValues);

        //Moet ook voor fietsen werken
        fetch('https://api.openrouteservice.org/v2/directions/cycling-regular', {
            method: "POST",
            headers: {
                'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
                'Authorization': API_KEY,
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: `{"coordinates":[${coordinateValues}],"preference":"fastest"}`
        }).then(response => response.json())
            .then((data) => {
                console.log(data);
            }).catch((err) => {
                console.error(err);
                res.status(500).json(err);
            });
    }).catch((err) => {
        console.error('Could not find orders: ' + err);
        res.status(500).json(err);
    });
});

module.exports = router;