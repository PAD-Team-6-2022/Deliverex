const router = require("express").Router();
const fetch = require('node-fetch');
const Order = require("../../models/order");
const User = require("../../models/user");
const Organisation = require("../../models/organisation");
const WeekSchedule = require("../../models/week_schedule");
const Location = require("../../models/location");
const API_KEY = process.env.ORS_API_KEY;
const cron = require("node-cron");
const {convertOrdersToShipments,
    convertUsersToVehicles,
    onSameDayDelivery} = require("../../util");
const convert = require("convert-units");
const moment = require("moment");
const web_push = require("web-push");
const auth = require("../../middleware/auth");
const {hashSync} = require("bcrypt");
const {or, QueryTypes} = require("sequelize");
const {Company} = require("../../models");

//TODO: GeoCode endpoint of address-finding to be placed here

//TODO: Make a cronjob that fires at the end of the day and
// checks whether all shipments of today are finished. If a
// shipment could not be delivered today, adjust its status
// to 'FAILED'. Also adjust the morning cronjob to set
// overdue/failed orders to 'READY' again and include them
// in todays scheduled deliveries.

//For debugging purposes. Comment it out if
//necessary but don't remove.
/*cron.schedule("* * * * * *", () => {

    console.log('\nSTATUS REPORT:')
    console.log(`Time: ${moment().format("HH:mm:ss")}`);

    console.log(`Queued orders:`)
    console.log(sameDayDeliveryQueue);

    console.log('Active couriers: ');
    const ids = [];
    activeCouriers.forEach((courier) => {
       ids.push(courier.id);
    });
    console.log(ids);
},{scheduled: true})*/


//Keys for identifying the server from the client perspective
//Moet in ENV file worden gestopt als enviroment variables
const publicVapidKey = 'BLxVvjwWFJLXU0nqPOxRB_cZZiDMMTeD6c-7gTDvatl3gak50_jM9AhpWMwmn3sOkd8Ga-xhnzhq-zYpVqueOnI';
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

web_push.setVapidDetails('mailto:test@test.com', publicVapidKey, privateVapidKey);

let activeCouriers = [];

router.post("/subscribe",auth(true),(req, res) => {
    //If there is already a subscription active of this user, remove the old
    //subscription before it can be replaced with this new one.
    for (let i = 0; i < activeCouriers.length; i++) {
        if(activeCouriers[i].id === req.user.id){
            activeCouriers.splice(i, 1);
        }
    }

    console.log('Received subscription request!')
    console.log(req.user.id)
    const courierData = {
        subscription: req.body,
        id: req.user.id
    };

    const notificationPayload = JSON.stringify({
        title: 'You are currently online',
        body: 'Your are ready to receive delivery notifications.'
    });

    activeCouriers.push(courierData);
    res.status(200).json({});
    web_push.sendNotification(activeCouriers[activeCouriers.length-1].subscription, notificationPayload)
        .catch((err) => console.error(`Error: could not send notification: ${err}`));
});

/**
 * Starts a loop of a specific order being offered to all
 * the available active couriers in the right order
 */
const initiateOrderRequestCycle = (orderId) => {
    //TODO: rewrite below query to use conventional sequalize methods
    Order.sequelize.query("SELECT users.id AS courier_id, COUNT(orders.id) AS count FROM users LEFT JOIN orders ON users.id = orders.courier_id WHERE users.role = 'COURIER' GROUP BY users.id;")
        .then((data) => {

            const courierLoads = data[0];
            //Helper array that narrows couriers down to their ID's
            let activeCourierIds = [];
            activeCouriers.forEach((courierData) => {
                activeCourierIds.push(courierData.id);
            });
            let activeCourierLoads = [];

            //Remove couriers from the list of possible couriers
            //to assign this order to
            courierLoads.forEach((courierLoadData, index) => {
                if(activeCourierIds.includes(courierLoadData.courier_id))
                    activeCourierLoads.push(courierLoads[index]);
            });
            activeCourierLoads.sort((a, b) => {
                return a.count - b.count;
            })

            const courierQueue = [];
            activeCourierLoads.forEach((courierLoadData) => {
                courierQueue.push(courierLoadData.courier_id);
            })
            const queueObject = {
                orderId,
                courierQueue
            };

            Order.findByPk(queueObject.orderId).then((order) => {

                //Loop through the active couriers to find whichever one corresponds to
                //the courier ID that the notification should be pushed to, and get its
                //subscription object.

                console.log(`Will send first notification to courier ${queueObject.courierQueue[0]}`);

                let courierSubscription;
                activeCouriers.forEach((courierData) => {
                    if(courierData.id === queueObject.courierQueue[0])
                        courierSubscription = courierData.subscription;
                });

                //The expiration time of the order request in seconds
                const requestExpirationTime = 90;

                //Welke company heeft deze order?
                //Welke location heeft die company?

                //TODO: Replace this ridiculous query
                Location.sequelize.query(`SELECT locations.* FROM orders
                                            INNER JOIN users ON orders.created_by = users.id 
                                            INNER JOIN companies ON users.company_id = companies.id 
                                            INNER JOIN locations ON companies.location_id = locations.location_id 
                                            WHERE orders.id = ${order.getDataValue('id')};`,
                    {type: QueryTypes.SELECT, model: Location, mapToModel: true})
                    .then((locationData) => {

                        const pickupLocation = locationData[0];
                        const orderId = order.getDataValue('id');

                        const shipment = {
                            amount: [1],
                            skills: [1],
                            pickup: {
                                id: orderId,
                                service: 60,
                                location: pickupLocation.getDataValue("coordinates").coordinates
                            },
                            delivery: {
                                id: orderId,
                                service: 60,
                                location: order.getDataValue("coordinates").coordinates
                            }
                        };

                        const vehicleProfile = {
                            id: orderId,
                            profile: "cycling-regular",
                            start: pickupLocation.getDataValue("coordinates").coordinates,
                            capacity: [4],
                            skills: [1],
                            time_window: [0, 86400]
                        }

                        fetch('https://api.openrouteservice.org/optimization', {
                            method: 'POST',
                            headers: {
                                'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
                                'Authorization': API_KEY,
                                'Content-Type': 'application/json; charset=utf-8'
                            },
                            body: '{"shipments": ' + JSON.stringify([shipment]) + ',' + '"vehicles": ' + JSON.stringify([vehicleProfile]) + ', "options":{"g":"true"}}'
                        }).then(response => response.json())
                            .then((data) => {

                                //Traveltime, in minutes by default
                                const travelTime = Math.round(moment.duration(data.routes[0].duration, 's').as('m'));

                                const distance = (Math.round((data.routes[0].distance / 1000) * 10) / 10);

                                const notificationPayload = JSON.stringify(
                                    {
                                        title: 'Request for delivery',
                                        type: 'deliveryRequest',
                                        body: `From: ${pickupLocation.getDataValue('city')}, ${pickupLocation.getDataValue('street')} ${pickupLocation.getDataValue('house_number')}\nTo: ${order.getDataValue('city')}, ${order.getDataValue('street')} ${order.getDataValue('house_number')}\n\nApproximately ${distance} kilometers or ${travelTime} minutes.\nThis request will expire in ${requestExpirationTime} seconds.`,
                                        expirationTime: requestExpirationTime,
                                        order,
                                        courierQueue: queueObject.courierQueue
                                    }
                                );

                                //Send the notification using web-push, along with the order details
                                web_push.sendNotification(courierSubscription, notificationPayload)
                                    .catch((err) => console.error(`Could not send notification: ${err}`));

                            })
                            .catch(() => {

                            });
                    })
            });

        })
}

//A list of orders/deliveries specifically meant for same-day-deliveries.
//Orders in this queue have not been scheduled before today, and have thus
//not been subject to the cron-job's morning routine wherein it distributes
// orders to couriers.
let sameDayDeliveryQueue = [];

//We use 'findOne' as we naturally assume there is only one organisation
Organisation.findOne().then((organisation) => {

    const freelanceMode = organisation.getDataValue('freelanceMode');

    //Get the time schedule
    WeekSchedule.findOne({where: {id: organisation.getDataValue('operatingScheduleId')}})
        .then((schedule) => {

            //TODO: Use the actual daily time-window rather than just the one of monday for every day
            const timeWindow = schedule.getDataValue('monday');

            const hoursAmount = moment(timeWindow.end, "HH:mm:ss").diff(moment(timeWindow.start, "HH:mm:ss"), "h");
            const formattedStartTime = moment(timeWindow.start, "HH:mm:ss").format("s m H");

            let cronjobSchedule = formattedStartTime;
            for (let i = 0; i < hoursAmount; i++) {
                cronjobSchedule += `,${moment(timeWindow.start, "HH:mm:ss").add(i+1, 'h').format("H")}`;
            }
            cronjobSchedule += ' * * *';

            //Sets the hourly cron-job
            cron.schedule(cronjobSchedule, () => {
                sameDayDeliveryQueue.forEach((orderId) => {
                    initiateOrderRequestCycle(orderId);
                });
            }, {scheduled: true});

            //The daily 'morning' cronjob for planned orders. Disabled in freelance mode.
            if(!freelanceMode)
                cron.schedule(`${formattedStartTime} * * *`, () => {

                const today = moment().format("YYYY-MM-DD");

                Order.findAll({
                    where: {
                        status: 'READY',
                        courier_id: null,
                        delivery_date: today
                    }
                }).then((orders) => {
                        console.log(`Assigning all unassigned orders of ${today}`);

                        if (!orders.length)
                            return;

                        //Checks if one or more of the orders are currently regarded
                        //as 'same-day-deliveries' and then subsequently excludes those
                        orders.forEach((order, index) => {
                            if(sameDayDeliveryQueue.includes(order.getDataValue('id')))
                                orders.splice(index, 1);
                        });

                        const shipments = convertOrdersToShipments(orders);

                        //Takes the current day of the week and converts it to lowercase
                        let dayOfTheWeek = moment().format('dddd').toLowerCase();

                            User.sequelize.query(`SELECT users.*, week_schedules.${dayOfTheWeek} FROM users INNER JOIN week_schedules ON users.work_schedule = week_schedules.id WHERE role = 'COURIER' AND week_schedules.${dayOfTheWeek} IS NOT NULL;`,
                                {type: QueryTypes.SELECT, model: User, mapToModel: true})
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
    });
});

//Event handler that is triggered when a new same-day-delivery has been
//requested for an order.
onSameDayDelivery( (orderId) => {

    //As an initial response, let the order go through a request cycle at least once
    initiateOrderRequestCycle(orderId);

    //Add the order to the hourly cron-job loop
    sameDayDeliveryQueue.push(orderId);
});

router.put('/submitSpontaneousDeliveryResponse', (req, res) => {

    const pushMessageData = req.body.data;

    if(req.body.answer === 'accepted'){
        //Assign the order to the user who has accepted
        Order.update({courier_id: req.user.id},{where: {id: pushMessageData.order.id}})
            .then((affectedRows) => {
            console.log(`Updated order ${pushMessageData.order.id}. ${affectedRows} rows affected.`);
        }).catch((err) => {
            console.error(`Could not update order. Error message: ${err}`)
        });

        //Remove the order from the sameDayDeliveryQueue
        sameDayDeliveryQueue.forEach((sameDayDelivery, index) => {
            if(sameDayDelivery === pushMessageData.order.id)
                sameDayDeliveryQueue.splice(index, 1);
        });
    }else if(req.body.answer === 'denied'){

        console.log(`RECEIVED DENIED MESSAGE!\nFrom: ${req.user.id}`);

        pushMessageData.courierQueue.shift();

        //In case there are no more available couriers to send the message to, simply return.
        //FYI: The hourly cronjob will (eventually) take care of this order
        if(!pushMessageData.courierQueue.length)
            return;

        //Try another courier
        //Retrieve the courier next in the queue for this order
        let nextQueuedCourier;
        nextQueuedCourier = pushMessageData.courierQueue[0];

        console.log(`Next queued courier: ${nextQueuedCourier}`);

        //Find the courier among active couriers, and take its subscription.
        let courierSubscription;
        activeCouriers.forEach((courier) => {
            if(courier.id === nextQueuedCourier){
                courierSubscription = courier.subscription;
            }
        });

        //Send the notification using web-push. The same payload is forwarded as taken
        //from the push message that was sent to the previous client.
        web_push.sendNotification(courierSubscription, JSON.stringify(pushMessageData))
            .catch((err) => console.error(`Could not send notification: ${err}`));
    }
    res.status(200).json();
});

router.get('/:longitude/:latitude', (req, res) => {

    //Pak alle orders van vandaag die bij deze koerier horen
    Order.findAll({where: {courier_id: req.user.id, delivery_date: moment().format("YYYY-MM-DD")},
        include: {model: User, as: 'userCreated', required: true,
            include: [{model: Company, as: 'company', required: true,
                include: [{model: Location, as: 'location', required: true}]}]}})
        .then((orders) => {

            //TODO: The data directly below is largely hardcoded and has to be
            // replaced by various factors from the database. See
            // 'utils.js' for further explanation.

            const shipments = convertOrdersToShipments(orders);
            const userCoordinates = [Number(req.params.longitude), Number(req.params.latitude)];

            //TODO: Currently hardcoded as 8:30 to 18:00 both here and in utils.js. To
            // be replaced with values from admin panel. Keep in mind whether its
            // freelance mode or not.
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
                    if (data.routes){
                        data.routes[0].steps.forEach((step) => {
                            orders.forEach((order) => {
                                if (order.getDataValue('id') === step.id && step.type !== 'start') {
                                    const isPickup = step.type === 'pickup';

                                    //If its a pickup, add a location object with the company location data. Otherwise,
                                    //add a location object with the order/destination location data.

                                    let rawPickUpLocation = order.getDataValue('userCreated').company.location;

                                    let checkpointLocation = isPickup ? {
                                        address: `${rawPickUpLocation.street} ${rawPickUpLocation.house_number}`,
                                        city: rawPickUpLocation.city,
                                        postal_code: rawPickUpLocation.postal_code,
                                        country: rawPickUpLocation.country
                                    } : {
                                        address: `${order.getDataValue('street')} ${order.getDataValue('house_number')}`,
                                        city: order.getDataValue('city'),
                                        postal_code: order.getDataValue('postal_code'),
                                        country: order.getDataValue('country')
                                    };

                                    checkpoints.push({
                                        location: checkpointLocation,
                                        type: step.type,
                                        order_id: step.id,
                                        time: moment((step.arrival - 3600) * 1000).format("HH:mm:ss"),
                                        hasCompleted: isPickup ?
                                            ((order.getDataValue('status') === 'TRANSIT' ||
                                                (order.getDataValue('status') === 'DELIVERED'))) :
                                            (order.getDataValue('status') === 'DELIVERED')
                                    });
                                }
                            });
                        });
                    }

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