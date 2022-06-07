/**
 * ORS.js does the heavy lifting behind the functionality of the
 * courier dashboard. In summary, it is mainly responsible for
 * the following tasks:
 *
 * 1. Managing order assignments to couriers that may or may not
 *    involve route calculations made by ORS.
 * 2. Providing couriers of the route that they should take based
 *    on their current location, the  orders that are assigned to
 *    them, and the calculations made by ORS.
 * 3. Utilizing the database-stored week-schedules of both the
 *    organisation and the individual couriers to set timed
 *    events such as automatic order-assignments in the morning,
 *    hourly order requests of pending orders, and the automatic
 *    'failing of undelivered orders when the workday is over.
 *
 * Additionally, ORS.js also establishes two-way communications
 * with every active courier by use of push-notifications and
 * (client-side) serviceworkers. This is necessary to make the
 * order-request system work.
 *
 * @Author: Thomas Linssen
 */

const router = require('express').Router();
const {Op} = require('sequelize');
const convert = require('convert-units');
const web_push = require('web-push');
const cron = require('node-cron');
const auth = require('../../middleware/auth');
const moment = require('moment');
const fetch = require('node-fetch');

//Database models
const {
    Order, User, Organisation,
    WeekSchedule, Location, Company,
} = require('../../models');

//Necessary utility functions
const {
    convertOrdersToShipments, convertUsersToVehicles,
    onSameDayDelivery, onOrderStatusChange,
    convertOrdersToJobs, getTimestampInSeconds
} = require('../../util');

const ORS_API_KEY = process.env.ORS_API_KEY;

/**
 * Uses the ORS Optimization routing algorithm to calculate
 * one or more routes using the given jobs, shipments and
 * vehicles.
 *
 * @param jobs represents tasks that involve only one
 * location.
 * @param shipments represents tasks that involve two
 * locations.
 * @param vehicles represents the traveling individual.
 * @returns {*} an object containing all the information
 * about the calculated route(s).
 */
const calculateOrsRoute = (jobs, shipments, vehicles) => {

    //Uses the jobs, shipments and vehicles to construct a
    // 'body' for the POST HTTP request for the ORS endpoint
    let body = {};
    if (shipments.length)
        body.shipments = shipments;
    if (jobs.length)
        body.jobs = jobs;
    if (vehicles.length)
        body.vehicles = vehicles;
    body.options = {g: true};

    return fetch('https://api.openrouteservice.org/optimization', {
        method: 'POST',
        headers: {
            Accept: 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
            Authorization: ORS_API_KEY,
            'Content-Type':
                'application/json; charset=utf-8',
        },
        body: JSON.stringify(body),
    }).then((response) => response.json());
}

/**
 * Calculates the amount of orders that every active courier
 * is currently assigned to and returns it.
 *
 * @returns {Promise<*[]>} an object containing the amount
 * of orders per courier id.
 */
const calculateCourierWorkLoads = async () => {
    //Group every courier with the amount of orders that he has
    // been assigned including couriers that don't have any orders
    // assigned at all.
    const courierLoadData = await Order.sequelize.query(
        "SELECT users.id AS courier_id, COUNT(orders.id) AS count" +
        " FROM users LEFT JOIN orders " +
        "ON users.id = orders.courier_id" +
        " WHERE users.role = 'COURIER' GROUP BY users.id;")
        .catch((err) => console.error(`Could not obtain order
         counts of couriers. Errormessage: ${err}`));

    if (!courierLoadData.length)
        return;

    const courierLoads = courierLoadData[0];

    //Helper array that narrows couriers down to their ID's
    let activeCourierIds = [];
    activeCouriers.forEach((courierData) => {
        activeCourierIds.push(courierData.id);
    });

    let activeCourierLoads = [];

    //Remove couriers from the list of possible couriers
    //to assign this order to
    courierLoads.forEach((courierLoadData, index) => {
        if (activeCourierIds.includes(courierLoadData.courier_id))
            activeCourierLoads.push(courierLoads[index]);
    });
    activeCourierLoads.sort((a, b) => {
        return a.count - b.count;
    });

    return activeCourierLoads;
}

/**
 * Sends a delivery request notification to a certain courier
 * using the given subscription object and metadata in the
 * delivery request.
 *
 * @param subscriptionObject subscription object representing
 * a client device.
 * @param requestMetadata metadata containing information about
 * which order is being requested for delivery and which couriers
 * it should be offered to.
 */
const sendRequestNotification = (subscriptionObject, requestMetadata) => {

    //The expiration time of the order request in seconds
    const requestExpirationTime = 90;

    //Retrieve the information over this order
    //including its pickup (company) location
    Order.findOne({
        where: {id: requestMetadata.orderId},
        include: {
            model: User, as: 'userCreated', required: true,
            include: [{
                model: Company, as: 'company', required: true,
                include: [{model: Location, as: 'location', required: true}]
            }]
        }
    }).then(async (order) => {

        const pickupLocation = order.userCreated.company.location;
        const orderId = order.id;

        //Convert the order and user data to shipment and vehicle data
        const shipment = convertOrdersToShipments([order])[0];
        const vehicleProfile = {
            id: orderId, profile: 'cycling-regular',
            start: pickupLocation.coordinates.coordinates,
            capacity: [4], skills: [1], time_window: [0, 86400],
        };

        //Calculate the route
        const routingData = await calculateOrsRoute([],
            [shipment], [vehicleProfile])
            .catch((err) => {
                console.error(`Could not perform ORS
                 optimization API call. Errormessage: ${err}`)
            });

        if (!routingData.length)
            return;

        //Convert the traveltime to minutes
        const travelTime = Math.round(moment.duration(
            routingData.routes[0].duration, 's').as('m'));

        //Convert the distance to kilometers
        const distance = Math.round((routingData.routes[0].distance / 1000) * 10) / 10;

        //Constructs a payload with a data-loaded message for the
        // delivery request notification
        const notificationPayload = JSON.stringify({
            title: 'Request for delivery',
            type: 'deliveryRequest',
            body: `From: ${pickupLocation.city}, 
                ${pickupLocation.street} 
                ${pickupLocation.house_number}
                \nTo: ${order.city}, 
                ${order.street} ${order.house_number}\n\nApproximately ${distance} kilometers or ${
                travelTime} minutes.\nThis request will expire in ${requestExpirationTime} seconds.`,
            expirationTime: requestExpirationTime,
            order,
            courierQueue: requestMetadata.courierQueue,
        });

        //Send the notification using web-push, along with the order details
        web_push.sendNotification(subscriptionObject, notificationPayload)
            .catch((err) => console.error(`Could not send notification: ${err}`));

    }).catch((err) =>
        console.error(`Could not obtain order information. Errormessage: ${err}`));
}

/**
 * Starts a loop of a specific order being offered to all
 * the available active couriers in the right order
 */
const initiateOrderRequestCycle = async (orderId) => {

    //Get an object representing the current workload of all the
    // active couriers ordered from least to heaviest
    const courierOrderAmounts = calculateCourierWorkLoads();

    //Extract the (ordered) courier ID's and put them in a separate array
    //representing a queue
    const courierQueue = [];
    courierOrderAmounts.forEach((courierLoadData) => {
        courierQueue.push(courierLoadData.courier_id);
    });

    //Finally, construct an object containing both the ID of the order
    // and the queue of couriers that delivery requests should be send to
    const requestMetadata = {
        orderId, courierQueue,
    };

    //Loop through the active couriers to find whichever one corresponds to
    //the courier ID that the notification should be pushed to, and get its
    //subscription object.
    let courierSubscription;
    activeCouriers.forEach((courierData) => {
        if (courierData.id === requestMetadata.courierQueue[0])
            courierSubscription = courierData.subscription;
    });

    console.log(`Will send first notification of order ${requestMetadata.orderId} to courier ${requestMetadata.courierQueue[0]}`);

    //Send the initial notification with the subscription and queue object
    sendRequestNotification(courierSubscription, requestMetadata);
};

/**
 * Sets a cronjob for assigning orders to couriers automatically
 * without requests based on the most efficient distribution of
 * order assignments. The cronjob will be set for a specific day
 * of the week for a specific timestamp.
 *
 * @param cronTime timestamp that the cronjob should fire
 * @param dayOfTheWeek day of the week
 */
const setPlannedMode = (cronTime, dayOfTheWeek) => {

    //Create a new cronjob event with a given time and day of week
    cron.schedule(`${convertToCronFormat(cronTime)} * * ${dayOfTheWeek}`,
        async () => {

            //Get the current date
            const today = moment().format('YYYY-MM-DD');

            //Find all orders that are supposed to be delivered today and are ready
            const unassignedOrders = await Order.findAll(
                {
                    where: {status: 'READY', courier_id: null, delivery_date: today},
                    include: {
                        model: User, as: 'userCreated', required: true,
                        include: [{
                            model: Company, as: 'company', required: true,
                            include: [{model: Location, as: 'location', required: true}]
                        }]
                    },
                }).catch((err) => console.error(`Could not find orders for
             the planned order assignments. Error message: ${err}`));

            if (!unassignedOrders.length)
                return;

            //Checks if one or more of the orders are currently regarded
            //as 'same-day-deliveries' and then subsequently excludes those
            unassignedOrders.forEach((order, index) => {
                if (pendingOrderQueue.includes(order.id))
                    unassignedOrders.splice(index, 1);
            });

            //Takes the current day of the week and converts it to lowercase
            const currentWeekDay = moment()
                .format('dddd')
                .toLowerCase();

            //Constructs an object representing a '[nameOfWeekday]: {Not equal to: null}' clause
            const notTodayObj = {};
            notTodayObj[currentWeekDay] = [{[Op.ne]: null}];

            //Get all the couriers that work today
            const couriers = await User.findAll({
                where: {role: 'COURIER'},
                include: {
                    model: WeekSchedule, as: 'schedule', required: true,
                    where: notTodayObj
                }
            })
                .catch((err) => console.error(`Could not find couriers to
                 assign planned orders to. Error message: ${err}`));

            if (!couriers.length)
                return;

            //Convert the orders to 'shipment' ORS format
            const shipments = convertOrdersToShipments(unassignedOrders);

            //Convert the couriers to 'vehicles' ORS format
            const vehicles = convertUsersToVehicles(couriers);

            const routingData = await calculateOrsRoute([], shipments, vehicles);
            if (!routingData.length)
                return;

            //Loop through every order of every route to assign the right orders to the right couriers
            routingData.routes.forEach((route) => {
                for (let i = 0; i < route.steps.length; i++) {
                    //To prevent updating the same order twice, we ignore steps of type 'start' and 'delivery'
                    if (route.steps[i].type === 'pickup')
                        Order.update(
                            {status: 'TRANSIT', courier_id: route.vehicle},
                            {where: {id: route.steps[i].id}},
                        ).then((rowsAffected) => {
                            console.log(`Updated order ${route.steps[i].id}. ${rowsAffected} rows affected.`);
                        }).catch((err) => {
                            console.log(`Could not update order ${route.steps[i].id}. Error message: ${err}`);
                        });
                }
            });
        },
        {
            scheduled: true,
        },
    );
}

/**
 * Sets a cronjob for the automatic failing of orders at
 * the end of a workday based on a given 'end time' and
 * day of the week.
 *
 * @param workdayEndTime timestamp that signifies the end
 * of the workday
 * @param dayOfTheWeek a specific day of the week
 */
const configureFailedDeliveries = (workdayEndTime, dayOfTheWeek) => {

    const today = moment().format('YYYY-MM-DD');
    cron.schedule(`${convertToCronFormat(workdayEndTime)} * * ${dayOfTheWeek}`,
        () => {
            Order.update({status: 'FAILED', courier_id: null},
                {where: {delivery_date: today, status: {[Op.ne]: 'DELIVERED'}}},
            ).then((rowsUpdated) => {
                console.log(`Updated ${rowsUpdated} orders to 'FAILED' status.`);
            }).catch((err) =>
                console.error(`Caught error in trying to update the
                     status of orders to 'FAILED'. Errormessage: ${err}`),
            );
        }, {scheduled: true},
    );
}

/**
 * Sets the hourly cronjob within a given timeframe for a
 * specific day of the week. Every time the cronjob runs,
 * pending orders will be send as delivery requests to
 * couriers.
 *
 * @param timeWindow timewindow wherein the delivery
 * requests should be send hourly
 * @param dayOfTheWeek a specific day of the week
 */
const setHourlyDeliveryRequests = (timeWindow, dayOfTheWeek) => {

    //The amount of hours between the start and end of the end
    const workHoursAmount = moment(timeWindow.end, 'HH:mm:ss').diff(
        moment(timeWindow.start, 'HH:mm:ss'),
        'h',
    );

    //Constructs an hourly schedule for the
    // currently looped-day in cron-format
    let hourlyRequestSchedule = convertToCronFormat(timeWindow.start);
    for (let i = 0; i < workHoursAmount; i++) {
        hourlyRequestSchedule += `,${moment(timeWindow.start, 'HH:mm:ss')
            .add(i + 1, 'h')
            .format('H')}`;
    }
    hourlyRequestSchedule += ` * * ${dayOfTheWeek}`;

    //Sets a cron-job with the hourly request schedule
    cron.schedule(hourlyRequestSchedule, () => {
        Order.findAll({
            where: {
                status: 'READY',
                id: {[Op.in]: pendingOrderQueue},
            },
        }).then((orders) => {
            orders.forEach(async (order) => {
                await initiateOrderRequestCycle(order.getDataValue('id'));
            });
        }).catch((err) =>
            console.error(`Failed to retrieve orders for
                 the hourly cronjob. Errormessage: ${err}`),
        );
    }, {scheduled: true});
}

/**
 * Converts a given timestamp of format 'HH:mm:ss' to cron format.
 *
 * @param timestamp timestamp to convert in 'HH:mm:ss' format
 * @returns {string} new, converted timestamp in cron format
 */
const convertToCronFormat = (timestamp) => {
    return moment(timestamp, 'HH:mm:ss').format('s m H');
}

/**
 * Sets up push notification functionality by configuring
 * the vapid details of the 'web_push' module.
 */
const configurePushNotifications = () => {

    //Keys for identifying the server from the client perspective
    const publicVapidKey = 'BLxVvjwWFJLXU0nqPOxRB_cZZiDMMTeD6c-7gTDvat' +
        'l3gak50_jM9AhpWMwmn3sOkd8Ga-xhnzhq-zYpVqueOnI';
    const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

    web_push.setVapidDetails('mailto:test@test.com', publicVapidKey, privateVapidKey);
}

/**
 * Converts the 'weight' property of every order in a given
 * list of orders to what is considered the most appropriate
 * form of unit.
 *
 * @param orders list of orders
 * @returns {*} the edited list of orders
 */
const transformOrderweights = (orders) => {
    orders.forEach((order) => {
        //converteer het gewicht van elke order naar de beste maat
        let value = convert(order.weight).from('g').toBest();
        order.weight = `${Math.round(value.val)} ${value.unit}`;

        // Format the created_at date
        order.date = moment(order.created_at).format(
            'YYYY-MM-DD',
        );
    });
    return orders;
}

/**
 * Returns a list of checkpoints based on the given routingData and list of
 * orders. Central to this function is that the checkpoints are categorized
 * as either pickups or deliveries.
 *
 * @param routingData routingData object
 * @param orders list of orders
 * @returns {*[]} a list of checkpoints
 */
const getCheckpointsFromRoute = (routingData, orders) => {
    const checkpoints = [];
    if (routingData.routes.length) {
        //Loop through each step (checkpoint) of the route
        routingData.routes[0].steps.forEach((step) => {
            orders.forEach((order) => {
                if (order.id === step.id && step.type !== 'start') {

                    //In case the type equals 'job', override that as a 'delivery'
                    step.type = step.type === 'pickup' ? 'pickup' : 'delivery';

                    //Take the type of this checkpoint
                    const isPickup = step.type === 'pickup';

                    //Take the location of this company as the orders pickup location
                    let rawPickUpLocation = order.userCreated.company.location;

                    //If its a pickup, add a location object with the company location data. Otherwise,
                    //add a location object with the order/destination location data.
                    let checkpointLocation;
                    if (isPickup)
                        checkpointLocation = {
                            address: `${rawPickUpLocation.street} ${rawPickUpLocation.house_number}`,
                            city: rawPickUpLocation.city,
                            postal_code:
                            rawPickUpLocation.postal_code,
                            country:
                            rawPickUpLocation.country,
                        }
                    else
                        checkpointLocation = {
                            address: `${order.street} ${order.house_number}`,
                            city: order.city,
                            postal_code: order.postal_code,
                            country: order.country,
                        }

                    //Push this checkpoint to an array of checkpoints
                    checkpoints.push({
                        location: checkpointLocation,
                        type: step.type,
                        order_id: step.id,
                        time: moment((step.arrival - 3600) * 1000,
                        ).format('HH:mm:ss'),
                    });
                }
            });
        });
    }
    return checkpoints;
}

/**
 * Returns an object containing routing data based on a
 * given location and list of orders.
 *
 * @param orders a list of orders
 * @param courierLocation the location of the courier
 * @returns {Promise<{length}|*>} the data of the route
 */
const calculateRoute = async (orders, courierLocation) => {

    //Divide the orders in 'picked up' and
    // 'not picked up' array categories
    const ordersNotPickedUp = [];
    const ordersPickedUp = [];
    orders.forEach((order) => {
        if (order.status === 'READY')
            ordersNotPickedUp.push(order);
        else if (order.status === 'TRANSIT')
            ordersPickedUp.push(order);
    });

    //Convert the orders to either jobs or shipments depending on
    //what type category it falls in
    const shipments = convertOrdersToShipments(ordersNotPickedUp);
    const jobs = convertOrdersToJobs(ordersPickedUp);

    //Retrieve this couriers weekschedule
    const courierWeekSchedule = orders[0].courier.schedule;

    //Get the current day of the week in string format
    const currentDayOfTheWeek = moment().format('dddd').toLowerCase();

    //Extract today's workschedule out of the entire
    // weekschedule based on the current day
    let courierDaySchedule;
    Object.keys(courierWeekSchedule.dataValues)
        .forEach((day, index) => {
            if (currentDayOfTheWeek === day)
                courierDaySchedule = Object.values(
                    courierWeekSchedule.dataValues)[index];
        })

    //Extract the start & end times of the workday
    const beginWorkDay = getTimestampInSeconds(courierDaySchedule.start);
    const endWorkDay = getTimestampInSeconds(courierDaySchedule.end);

    //Calculate the timewindow from now till the end of the workday.
    // For this, we take the current timestamp and clamp it between
    // the start & end time.
    const currentTimeInSeconds = moment()
        .diff(moment().startOf('day'), 'seconds');
    const working_hours = [
        Math.max(beginWorkDay, Math.min(currentTimeInSeconds, endWorkDay)),
        endWorkDay,
    ];

    const courierId = orders[0].courier.id;
    //Create a vehicle object to represent this courier in the ORS calculation
    const vehicle = {
        id: courierId, profile: 'cycling-regular',
        start: courierLocation, capacity: [4],
        skills: [1], time_window: working_hours //[0,80000]
    };

    //Pass the constructed jobs, shipments and vehicle data to the
    // 'calculateRoute' function. This will return the data for a route.
    const routingData = await calculateOrsRoute(jobs, shipments, [vehicle])
        .catch((err) => {
            console.error(`Could not perform ORS 
                    optimization API call. Errormessage: ${err}`);
        });

    if (!routingData)
        return;

    return routingData;
}

/**
 * Sets all the timed events (cron jobs) for core order-management. These
 * events include the hourly sending of order requests of pending orders,
 * putting past-due orders on 'FAILED' status, and optionally automatically
 * distributing 'planned' orders over couriers at the start of the workday.
 * All of these cronjobs are configured based on the organisation's weekly
 * operating schedule.
 */
const setTimingActions = () => {

    //Retrieves the organisation along with its operating schedule. We use
    //'findOne' as we naturally assume there is only one organisation.
    Organisation.findOne({
        include: {
            model: WeekSchedule, as: 'operating_schedule', required: true,
            attributes: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        }
    })
        .then((organisation) => {

            const plannedMode = organisation.getDataValue('plannedMode');

            const weekSchedule = organisation.getDataValue('operating_schedule').dataValues;

            //Loop over each day of the week and set the appropriate timing
            // events (cronjobs) based on the timewindow associated with each day
            for (let i = 0; i < 7; i++) {

                //Retrieve the name of the week and its correlating start- and end times
                const dayOfTheWeek = Object.keys(weekSchedule)[i];
                const timeWindow = Object.values(weekSchedule)[i];

                //In case there is no schedule for this day,
                //don't set any timing events for it
                if (timeWindow === null)
                    continue;

                //Sets the cronjob for the hourly delivery requests for
                //the currently looped-day
                setHourlyDeliveryRequests(timeWindow, dayOfTheWeek);

                //The daily 'morning' cronjob for planned orders. Disabled in freelance mode.
                if (plannedMode)
                    setPlannedMode(timeWindow.start, dayOfTheWeek);

                //Sets a cronjob that puts orders on 'failed' at the end of
                //the workday with respects to what day of the week it is
                // and which timewindow is associated with that day
                configureFailedDeliveries(timeWindow.end, dayOfTheWeek);
            }
        });
}

/**
 * Event handler that is triggered when a new same-day-delivery has
 * been requested for an order. The function adds an order to the
 * same-day-delivery loop.
 */
onSameDayDelivery((orderId) => {
    pendingOrderQueue.push(Number(orderId));
});

/**
 * Event that fires once the status of an order has been updated. The
 * eventhandler will initiate a new cycle of order requests for a
 * specific order in case the orders status has been changed to 'READY'.
 */
onOrderStatusChange((id, status) => {
    if (pendingOrderQueue.includes(Number(id)) && status === 'READY')
        initiateOrderRequestCycle(id);
});

/**
 * Endpoint that receives subscription requests for push notifications. This
 * endpoint will respond by sending an 'online' notification and adding the
 * courier to the list of active couriers.
 */
router.post('/subscribe', auth(true), (req, res) => {

    //If there is already a subscription active of this user, remove the old
    //subscription before it can be replaced with this new one.
    for (let i = 0; i < activeCouriers.length; i++) {
        if (activeCouriers[i].id === req.user.id)
            activeCouriers.splice(i, 1);
    }

    //Retrieve courier data
    const courierData = {
        subscription: req.body, id: req.user.id,
    };

    //Construct a payload for the 'online' notification
    const notificationPayload = JSON.stringify({
        title: 'You are currently online',
        body: 'Your are ready to receive delivery notifications.',
    });

    //Add the courier to the list of active couriers
    activeCouriers.push(courierData);

    //Send a '200' status and push the notification
    res.status(200).json({});
    web_push.sendNotification(
        activeCouriers[activeCouriers.length - 1].subscription,
        notificationPayload)
        .catch((err) =>
            console.error(`Error: could not send notification: ${err}`),
        );
});

/**
 * Interprets a message sent from a client containing either an
 * 'accepted' or 'denied' message as an answer to an order request
 * sent by the server. Depending on the message, the server will either
 * assign the order to this client/courier or continue the order request cycle.
 */
router.put('/submitSpontaneousDeliveryResponse', (req, res) => {
    const pushMessageData = req.body.data;

    if (req.body.answer === 'accepted') {
        //Assign the order to the user who has accepted
        Order.update({courier_id: req.user.id},
            {where: {id: pushMessageData.order.id}})
            .then((affectedRows) => {
                console.log(
                    `Updated order ${pushMessageData.order.id}. ${affectedRows} rows affected.`,
                );
            })
            .catch((err) => {
                console.error(`Could not update order. Error message: ${err}`);
            });

        //Remove the order from the sameDayDeliveryQueue
        pendingOrderQueue.forEach((sameDayDelivery, index) => {
            if (sameDayDelivery === pushMessageData.order.id)
                pendingOrderQueue.splice(index, 1);
        });
    } else if (req.body.answer === 'denied') {
        pushMessageData.courierQueue.shift();

        //In case there are no more available couriers to send the message to, simply return.
        //FYI: The hourly cronjob will (eventually) take care of this order
        if (!pushMessageData.courierQueue.length) return;

        //Try another courier
        //Retrieve the courier next in the queue for this order
        let nextQueuedCourier;
        nextQueuedCourier = pushMessageData.courierQueue[0];

        //Find the courier among active couriers, and take its subscription.
        let courierSubscription;
        activeCouriers.forEach((courier) => {
            if (courier.id === nextQueuedCourier) {
                courierSubscription = courier.subscription;
            }
        });

        //Send the notification using web-push. The same payload is forwarded as taken
        //from the push message that was sent to the previous client.
        web_push.sendNotification(courierSubscription, JSON.stringify(pushMessageData))
            .catch((err) =>
                console.error(`Could not send notification: ${err}`),
            );
    }
    res.status(200).json();
});

/**
 * Calculates and returns a list of location checkpoints for a courier
 * based on his current location and list of assigned orders.
 */
router.get('/coords/:longitude/:latitude', (req, res) => {

    //Pak alle orders van vandaag die bij deze koerier horen
    Order.findAll({
        where: {courier_id: req.user.id, delivery_date: moment().format('YYYY-MM-DD')},
        include: [{
            model: User, as: 'userCreated', required: true,
            include: [{
                model: Company, as: 'company', required: true, include: [
                    {model: Location, as: 'location', required: true}]
            }]
        },
            {
                model: User, as: 'courier', required: true,
                include: [{model: WeekSchedule, as: 'schedule', required: true}]
            }],
    }).then(async (orders) => {

        //Take the user's coordinates from the query arguments
        const userCoordinates = [
            Number(req.params.longitude),
            Number(req.params.latitude),
        ];

        //Get the route
        const routingData = await calculateRoute(orders, userCoordinates);

        //Improve the formatting of the 'weight' property
        orders = transformOrderweights(orders);

        //Get the checkpoints (pickup and delivery) using the routing data
        const checkpoints = getCheckpointsFromRoute(routingData, orders);

        //Send the checkpoints back to the client
        res.status(200).json({
            checkpoints,
            user: req.user,
            total_duration: routingData.duration,
        });
    }).catch((err) => {
        console.error(
            `Failed to retrieve orders from database. Errormessage: ${err}`,
        );
    });
});

/**
 * Uses ORS to return a list of locations based on a given
 * search query string.
 *
 * @Author: Niels Peetoom
 */
router.get("/find/:query", (req, res) => {
    fetch(`https://api.openrouteservice.org/geocode/search?api_key=${
            ORS_API_KEY}&text=${req.params.query}&boundary.country=NL`)
        .then((res) => res.json())
        .then((data) => {
            res.status(200).json({
                features: data.features
            });
        }).catch((err) => res.status(500).json({ err }));
});

//Array to keeps track of currently-active couriers
let activeCouriers = [];

//A list of orders/deliveries specifically meant for pending orders
let pendingOrderQueue = [];

//Sets up push notification functionality
configurePushNotifications();

//Enable/configure the timing events for
// the assigning of orders
setTimingActions();

module.exports = router;

//For debugging purposes. Comment it out if
//necessary but don't remove.
/*
cron.schedule(
    '0,10,20,30,40,50 * * * * *',
    () => {
        console.log('\nSTATUS REPORT:');
        console.log(`Time: ${moment().format('HH:mm:ss')}`);

        console.log(`Queued orders:`);
        console.log(pendingOrderQueue);

        console.log('Active couriers: ');
        const ids = [];
        activeCouriers.forEach((courier) => {
            ids.push(courier.id);
        });
        console.log(ids);
    },
    {scheduled: true},
);
*/