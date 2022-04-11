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


        fetch('https://api.openrouteservice.org/optimization', {
            method: 'POST',
            headers: {
                'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
                'Authorization': '5b3ce3597851110001cf62482d328da4ad724df196a3e2f0af3e15f3',
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: '{"jobs":[' +
                '{"id":1,"service":300,"amount":[1],"location":[1.98935,48.701],"skills":[1],"time_windows":[[32400,36000]]},' +
                '{"id":2,"service":300,"amount":[1],"location":[2.03655,48.61128],"skills":[1]},' +
                '{"id":3,"service":300,"amount":[1],"location":[2.39719,49.07611],"skills":[2]},' +
                '{"id":4,"service":300,"amount":[1],"location":[2.41808,49.22619],"skills":[2]},' +
                '{"id":5,"service":300,"amount":[1],"location":[2.28325,48.5958],"skills":[14]},' +
                '{"id":6,"service":300,"amount":[1],"location":[2.89357,48.90736],"skills":[14]' +
                '}],' +
                '' +
                '"vehicles":[' +
                '{"id":1,"profile":"driving-car","start":[2.35044,48.71764],"end":[2.35044,48.71764],"capacity":[4],"skills":[1,14],"time_window":[28800,43200]},' +
                '{"id":2,"profile":"cycling-regular","start":[2.35044,48.71764],"end":[2.35044,48.71764],"capacity":[4],"skills":[2,14],"time_window":[28800,43200]}' +
                ']}'
        }).then(response => response.json())
            .then((data) => {
                console.log(data);
                //console.log(data.routes[0].steps);
            }).catch((err) => {
                console.error(err);
            });

        /*
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
        */

    }).catch((err) => {
        console.error('Could not find orders: ' + err);
        res.status(500).json(err);
    });
});

module.exports = router;