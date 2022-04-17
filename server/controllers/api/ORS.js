const router = require("express").Router();
const fetch = require('node-fetch');
const Order = require("../../models/order");
const User = require("../../models/user");
const API_KEY = process.env.ORS_API_KEY;
const cron = require("node-cron");
const {convertOrdersToShipments, convertUsersToVehicles} = require("../../util");
const convert = require("convert-units");
const moment = require("moment");

//TODO: GeoCode endpoint of address-finding to be placed here

//TODO: Make a cronjob that fires at the end of the day and
// checks whether all shipments of today are finished. If a
// shipment could not be delivered today, adjust its status
// to 'FAILED'. Also adjust the morning cronjob to set
// overdue/failed orders to 'READY' again and include them
// in todays scheduled deliveries.

//The time at which new orders will be assigned. To be retrieved
// from database. Currently hardcoded to 8:30.
const SCHEDULING_TIME = "0 30 8";


//TODO: Replace below solution to one that uses
// moment and is more reliable
/**
 * Gets the current date and convert it to the same format
 * as the database returns its dates in.
 *
 * @returns {string}
 */
const getFormattedDate = () => {
    const today = new Date();
    const todayMonth = (today.getMonth() + 1) < 10 ?
        `0${(today.getMonth() + 1)}` :
        (today.getMonth() + 1);
    const todayDate = today.getDate() < 10 ?
        `0${today.getDate()}` : today.getDate();
    return `${today.getFullYear()}-${todayMonth}-${todayDate}`;
}

//Is called every day at a specified time
cron.schedule(`${SCHEDULING_TIME} * * *`, () => {

    //TODO: Retrieve begin & end-time working
    // hours from the database and use it to check
    // which couriers are available for the day
    const BEGIN_TIME = 0;
    const END_TIME = 342424;

    const todayConverted = getFormattedDate();

    Order.findAll({
        where: {
            status: 'READY',
            courier_id: null, delivery_date: todayConverted
        }
    })
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

router.get('/:longitude/:latitude', (req, res) => {

    Order.findAll({where: {courier_id: req.user.id, delivery_date: getFormattedDate()}})
        .then((orders) => {
            //TODO: The data directly below is largely hardcoded and has to be
            // replaced by various factors from the database. See
            // 'utils.js' for further explanation.

            const shipments = convertOrdersToShipments(orders);
            const userCoordinates = [Number(req.params.longitude), Number(req.params.latitude)];

            //TODO: Currently hardcoded as 8:30 to 18:00 both here and in utils.js. To
            // be replaced with values from admin panel.
            const beginWorkDay = 30600;
            const endWorkDay = 90000;

            const currentTimeInSeconds = moment().diff(moment().startOf('day'), 'seconds');

            const working_hours = [Math.max(beginWorkDay, currentTimeInSeconds), endWorkDay];
            const vehicle = {
                id: req.user.id,
                profile: "cycling-regular",
                start: userCoordinates,
                capacity: [4],
                skills: [1],
                time_window: working_hours
            };

            fetch('https://api.openrouteservice.org/optimization', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
                    'Authorization': process.env.ORS_API_KEY,
                    'Content-Type': 'application/json; charset=utf-8'
                },
                body: '{"shipments": ' + JSON.stringify(shipments) + ',' +
                    '"vehicles": ' + JSON.stringify([vehicle]) + '}'
            }).then(response => response.json())
                .then((data) => {
                    orders.forEach((order) => {
                        //converteer het gewicht van elke order naar de beste maat
                        let value = convert(order.weight).from("g").toBest();
                        order.weight = `${Math.round(value.val)} ${value.unit}`;

                        // Format the created_at date
                        order.date = moment(order.created_at).format("YYYY-MM-DD");
                    });

                    const checkpoints = [];
                    if (data.routes)
                        data.routes[0].steps.forEach((step) => {
                            orders.forEach((order) => {
                                if (order.getDataValue('id') === step.id) {
                                    if (step.type !== 'start') {
                                        const isPickup = step.type === 'pickup';
                                        checkpoints.push({
                                            location: {
                                                address:
                                                    `${order.getDataValue(isPickup ? 'pickup_street' : 'street')} ${order
                                                        .getDataValue(isPickup ? 'pickup_house_number' : 'house_number')}`,
                                                city: order.getDataValue(isPickup ? 'pickup_city' : 'city'),
                                                postal_code: order.getDataValue(isPickup ? 'pickup_postal_code' : 'postal_code'),
                                                country: order.getDataValue(isPickup ? 'pickup_country' : 'country')
                                            },
                                            type: step.type,
                                            order_id: step.id,
                                            time: moment((step.arrival - 3600) * 1000).format("HH:mm:ss"),
                                            hasCompleted: isPickup ?
                                                ((order.getDataValue('status') === 'TRANSIT' ||
                                                    (order.getDataValue('status') === 'DELIVERED'))) :
                                                (order.getDataValue('status') === 'DELIVERED')
                                        });
                                    }
                                }
                            });
                        });
                    res.status(200).json({
                        checkpoints,
                        user: req.user,
                        total_duration: data.duration
                    });
                }).catch((err) => {
                console.log(err);
                res.status(500).json(err);
            })
        }).catch((err) => {
        console.error(`Failed to retrieve orders from database. Errormessage: ${err}`)
    })
});

module.exports = router;