const router = require("express").Router();
const fetch = require('node-fetch');
const Order = require("../../models/order");
const User = require("../../models/user");
const API_KEY = process.env.ORS_API_KEY;
const cron = require("node-cron");
const {convertOrdersToShipments, convertUsersToVehicles} = require("../../util");

//TODO: GeoCode endpoint of address-finding to be placed here

//The time at which new orders will be assigned. To be retrieved
// from database. Currently hardcoded to 8:30.
const SCHEDULING_TIME = "0 30 8";

//Is called every day at a specified time
cron.schedule(`${SCHEDULING_TIME} * * *`, () => {

    //TODO: Retrieve begin & end-time working
    // hours from the database and use it to check
    // which couriers are available for the day
    const BEGIN_TIME = 0;
    const END_TIME = 342424;

    //Get the current date and convert it to the same format
    // as the database returns its dates in
    const today = new Date();
    const todayMonth = (today.getMonth() + 1) < 10 ?
        `0${(today.getMonth() + 1)}` :
        (today.getMonth() + 1);
    const todayDate = today.getDate() < 10 ?
        `0${today.getDate()}` : today.getDate();
    const todayConverted = `${today.getFullYear()}-${todayMonth}-${todayDate}`;

    Order.findAll({where: {status: 'READY',
            courier_id: null, delivery_date: todayConverted}})
        .then((orders) => {
            console.log(`Assigning all unassigned orders of ${todayConverted}`);

            if (!orders.length)
                return;

            const shipments = convertOrdersToShipments(orders);

            //TODO: check whether the user works between 'BEGIN_TIME' and 'END_TIME' of today
            User.findAll({where: {role: 'COURIER'}})
                .then((users) => {
                    const vehicles = convertUsersToVehicles(users);

                    fetch('https://api.openrouteservice.org/optimization', {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
                            'Authorization': API_KEY,
                            'Content-Type': 'application/json; charset=utf-8'
                        },
                        body: '{"shipments": ' + JSON.stringify(shipments) + ',' + '"vehicles": ' + JSON.stringify(vehicles) + '}'
                    }).then(response => response.json())
                        .then((data) => {
                            //Loop through every order of every route to assign the right orders to the right couriers
                            data.routes.forEach((route) => {
                                for (let i = 0; i < route.steps.length; i++) {
                                    //To prevent updating the same order twice, we ignore steps of type 'start' and 'delivery'
                                    if (route.steps[i].type === 'pickup')
                                        Order.update({status: 'TRANSIT', courier_id: route.vehicle},
                                            {where: {id: route.steps[i].id}}).then((rowsAffected) => {
                                            console.log(`Updated order ${route.steps[i].id}. ${rowsAffected} rows affected.`)
                                        }).catch((err) => {
                                            console.log(`Could not update order ${route.steps[i].id}. Error message: ${err}`)
                                        });
                                }
                            })
                        }).catch((err) => {
                        console.error(err);
                    });
                }).catch((err) => {
                console.error(`Failed to retrieve couriers from database. Errormessage: ${err}`)
            })
        }).catch((err) => {
        console.error(`Failed to retrieve orders from database. Errormessage: ${err}`)
    });
}, {
    scheduled: true
});

module.exports = router;