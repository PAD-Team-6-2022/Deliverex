const router = require('express').Router();
const fetch = require('node-fetch');
const { Op, QueryTypes } = require('sequelize');
const {
    Order,
    User,
    Organisation,
    WeekSchedule,
    Location,
    Company,
} = require('../../models');
const API_KEY = process.env.ORS_API_KEY;
const cron = require('node-cron');
const {
    convertOrdersToShipments,
    convertUsersToVehicles,
    onSameDayDelivery,
    onOrderStatusChange,
    convertOrdersToJobs,
} = require('../../util');
const convert = require('convert-units');
const moment = require('moment');
const web_push = require('web-push');
const auth = require('../../middleware/auth');

//TODO: GeoCode endpoint of address-finding to be placed here

//For debugging purposes. Comment it out if
//necessary but don't remove.
cron.schedule(
    '0,10,20,30,40,50 * * * * *',
    () => {
        console.log('\nSTATUS REPORT:');
        console.log(`Time: ${moment().format('HH:mm:ss')}`);

        console.log(`Queued orders:`);
        console.log(sameDayDeliveryQueue);

        console.log('Active couriers: ');
        const ids = [];
        activeCouriers.forEach((courier) => {
            ids.push(courier.id);
        });
        console.log(ids);
    },
    { scheduled: true },
);

//Keys for identifying the server from the client perspective
//Moet in ENV file worden gestopt als environment variables
const publicVapidKey =
    'BLxVvjwWFJLXU0nqPOxRB_cZZiDMMTeD6c-7gTDvatl3gak50_jM9AhpWMwmn3sOkd8Ga-xhnzhq-zYpVqueOnI';
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

web_push.setVapidDetails(
    'mailto:test@test.com',
    publicVapidKey,
    privateVapidKey,
);

let activeCouriers = [];

router.post('/subscribe', auth(true), (req, res) => {
    //If there is already a subscription active of this user, remove the old
    //subscription before it can be replaced with this new one.
    for (let i = 0; i < activeCouriers.length; i++) {
        if (activeCouriers[i].id === req.user.id) {
            activeCouriers.splice(i, 1);
        }
    }

    console.log('Received subscription request!');
    console.log(req.user.id);
    const courierData = {
        subscription: req.body,
        id: req.user.id,
    };

    const notificationPayload = JSON.stringify({
        title: 'You are currently online',
        body: 'Your are ready to receive delivery notifications.',
    });

    activeCouriers.push(courierData);
    res.status(200).json({});
    web_push
        .sendNotification(
            activeCouriers[activeCouriers.length - 1].subscription,
            notificationPayload,
        )
        .catch((err) =>
            console.error(`Error: could not send notification: ${err}`),
        );
});

/**
 * Starts a loop of a specific order being offered to all
 * the available active couriers in the right order
 */
const initiateOrderRequestCycle = (orderId) => {
    //TODO: rewrite below query to use conventional sequalize methods
    Order.sequelize
        .query(
            "SELECT users.id AS courier_id, COUNT(orders.id) AS count FROM users LEFT JOIN orders ON users.id = orders.courier_id WHERE users.role = 'COURIER' GROUP BY users.id;",
        )
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
                if (activeCourierIds.includes(courierLoadData.courier_id))
                    activeCourierLoads.push(courierLoads[index]);
            });
            activeCourierLoads.sort((a, b) => {
                return a.count - b.count;
            });

            const courierQueue = [];
            activeCourierLoads.forEach((courierLoadData) => {
                courierQueue.push(courierLoadData.courier_id);
            });

            const queueObject = {
                orderId,
                courierQueue,
            };

            Order.findByPk(queueObject.orderId).then((order) => {
                //Loop through the active couriers to find whichever one corresponds to
                //the courier ID that the notification should be pushed to, and get its
                //subscription object.

                console.log(
                    `Will send first notification to courier ${queueObject.courierQueue[0]}`,
                );

                let courierSubscription;
                activeCouriers.forEach((courierData) => {
                    if (courierData.id === queueObject.courierQueue[0])
                        courierSubscription = courierData.subscription;
                });

                //The expiration time of the order request in seconds
                const requestExpirationTime = 90;

                //Welke company heeft deze order?
                //Welke location heeft die company?

                //TODO: Replace this ridiculous query
                Location.sequelize
                    .query(
                        `SELECT locations.* FROM orders
                                            INNER JOIN users ON orders.created_by = users.id 
                                            INNER JOIN companies ON users.company_id = companies.id 
                                            INNER JOIN locations ON companies.location_id = locations.location_id 
                                            WHERE orders.id = ${order.getDataValue(
                                                'id',
                                            )};`,
                        {
                            type: QueryTypes.SELECT,
                            model: Location,
                            mapToModel: true,
                        },
                    )
                    .then((locationData) => {
                        const pickupLocation = locationData[0];
                        const orderId = order.getDataValue('id');

                        const shipment = {
                            amount: [1],
                            skills: [1],
                            pickup: {
                                id: orderId,
                                service: 60,
                                location:
                                    pickupLocation.getDataValue('coordinates')
                                        .coordinates,
                            },
                            delivery: {
                                id: orderId,
                                service: 60,
                                location:
                                    order.getDataValue('coordinates')
                                        .coordinates,
                            },
                        };

                        const vehicleProfile = {
                            id: orderId,
                            profile: 'cycling-regular',
                            start: pickupLocation.getDataValue('coordinates')
                                .coordinates,
                            capacity: [4],
                            skills: [1],
                            time_window: [0, 86400],
                        };

                        fetch('https://api.openrouteservice.org/optimization', {
                            method: 'POST',
                            headers: {
                                Accept: 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
                                Authorization: API_KEY,
                                'Content-Type':
                                    'application/json; charset=utf-8',
                            },
                            body:
                                '{"shipments": ' +
                                JSON.stringify([shipment]) +
                                ',' +
                                '"vehicles": ' +
                                JSON.stringify([vehicleProfile]) +
                                ', "options":{"g":"true"}}',
                        })
                            .then((response) => response.json())
                            .then((data) => {
                                //Traveltime, in minutes by default
                                const travelTime = Math.round(
                                    moment
                                        .duration(data.routes[0].duration, 's')
                                        .as('m'),
                                );

                                const distance =
                                    Math.round(
                                        (data.routes[0].distance / 1000) * 10,
                                    ) / 10;

                                const notificationPayload = JSON.stringify({
                                    title: 'Request for delivery',
                                    type: 'deliveryRequest',
                                    body: `From: ${pickupLocation.getDataValue(
                                        'city',
                                    )}, ${pickupLocation.getDataValue(
                                        'street',
                                    )} ${pickupLocation.getDataValue(
                                        'house_number',
                                    )}\nTo: ${order.getDataValue(
                                        'city',
                                    )}, ${order.getDataValue(
                                        'street',
                                    )} ${order.getDataValue(
                                        'house_number',
                                    )}\n\nApproximately ${distance} kilometers or ${travelTime} minutes.\nThis request will expire in ${requestExpirationTime} seconds.`,
                                    expirationTime: requestExpirationTime,
                                    order,
                                    courierQueue: queueObject.courierQueue,
                                });

                                //Send the notification using web-push, along with the order details
                                web_push
                                    .sendNotification(
                                        courierSubscription,
                                        notificationPayload,
                                    )
                                    .catch((err) =>
                                        console.error(
                                            `Could not send notification: ${err}`,
                                        ),
                                    );
                            })
                            .catch(() => {});
                    });
            });
        });
};

//A list of orders/deliveries specifically meant for same-day-deliveries.
//Orders in this queue have not been scheduled before today, and have thus
//not been subject to the cron-job's morning routine wherein it distributes
// orders to couriers.
let sameDayDeliveryQueue = [];

//We use 'findOne' as we naturally assume there is only one organisation
Organisation.findOne().then((organisation) => {
    const freelanceMode = organisation.getDataValue('freelanceMode');

    //Get the time schedule
    WeekSchedule.findOne({
        where: { id: organisation.getDataValue('operatingScheduleId') },
    }).then((schedule) => {
        const weekDays = [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
        ];

        //For each day of the week, set a daily and hourly cronjob
        for (let i = 0; i < 7; i++) {
            const dayOfTheWeek = weekDays[i];

            //In case there is no schedule for this day, simply skip it
            if (schedule.getDataValue(dayOfTheWeek.toLowerCase()) === null)
                continue;

            const timeWindow = schedule.getDataValue(
                dayOfTheWeek.toLowerCase(),
            );

            const hoursAmount = moment(timeWindow.end, 'HH:mm:ss').diff(
                moment(timeWindow.start, 'HH:mm:ss'),
                'h',
            );
            const formattedStartTime = moment(
                timeWindow.start,
                'HH:mm:ss',
            ).format('s m H');

            let cronjobSchedule = formattedStartTime;
            for (let i = 0; i < hoursAmount; i++) {
                cronjobSchedule += `,${moment(timeWindow.start, 'HH:mm:ss')
                    .add(i + 1, 'h')
                    .format('H')}`;
            }
            cronjobSchedule += ` * * ${dayOfTheWeek}`;

            //Sets the hourly cron-job
            cron.schedule(
                cronjobSchedule,
                () => {
                    Order.findAll({
                        where: {
                            status: 'READY',
                            id: { [Op.in]: sameDayDeliveryQueue },
                        },
                    })
                        .then((orders) => {
                            orders.forEach((order) => {
                                initiateOrderRequestCycle(
                                    order.getDataValue('id'),
                                );
                            });
                        })
                        .catch((err) =>
                            console.error(`Failed to retrieve orders for
                     the hourly cronjob. Errormessage: ${err}`),
                        );
                },
                { scheduled: true },
            );

            //The daily 'morning' cronjob for planned orders. Disabled in freelance mode.
            if (!freelanceMode)
                cron.schedule(
                    `${formattedStartTime} * * ${dayOfTheWeek}`,
                    () => {
                        const today = moment().format('YYYY-MM-DD');

                        Order.findAll({
                            where: {
                                status: 'READY',
                                courier_id: null,
                                delivery_date: today,
                            },
                            include: {
                                model: User,
                                as: 'userCreated',
                                required: true,
                                include: [
                                    {
                                        model: Company,
                                        as: 'company',
                                        required: true,
                                        include: [
                                            {
                                                model: Location,
                                                as: 'location',
                                                required: true,
                                            },
                                        ],
                                    },
                                ],
                            },
                        })
                            .then((orders) => {
                                console.log(
                                    `Assigning all unassigned orders of ${today}`,
                                );

                                console.log(
                                    'Found amount of orders: ' + orders.length,
                                );
                                console.log('Orders:');

                                if (!orders.length) return;

                                orders.forEach((order) => {
                                    console.log(order.getDataValue('id'));
                                });

                                if (!orders.length) return;

                                //Checks if one or more of the orders are currently regarded
                                //as 'same-day-deliveries' and then subsequently excludes those
                                orders.forEach((order, index) => {
                                    if (
                                        sameDayDeliveryQueue.includes(
                                            order.getDataValue('id'),
                                        )
                                    )
                                        orders.splice(index, 1);
                                });

                                const shipments =
                                    convertOrdersToShipments(orders);

                                //Takes the current day of the week and converts it to lowercase
                                let currentWeekDay = moment()
                                    .format('dddd')
                                    .toLowerCase();

                                //Take all users who work today
                                User.sequelize
                                    .query(
                                        `SELECT users.*, week_schedules.${currentWeekDay} AS 'todaySchedule' FROM users INNER JOIN week_schedules ON users.schedule_id = week_schedules.id WHERE role = 'COURIER' AND week_schedules.${currentWeekDay} IS NOT NULL;`,
                                        {
                                            type: QueryTypes.SELECT,
                                            model: User,
                                            mapToModel: true,
                                        },
                                    )
                                    .then((users) => {
                                        console.log('users:');
                                        console.log(users);

                                        if (!users.length) return;

                                        const vehicles =
                                            convertUsersToVehicles(users);

                                        fetch(
                                            'https://api.openrouteservice.org/optimization',
                                            {
                                                method: 'POST',
                                                headers: {
                                                    Accept: 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
                                                    Authorization: API_KEY,
                                                    'Content-Type':
                                                        'application/json; charset=utf-8',
                                                },
                                                body:
                                                    '{"shipments": ' +
                                                    JSON.stringify(shipments) +
                                                    ',' +
                                                    '"vehicles": ' +
                                                    JSON.stringify(vehicles) +
                                                    '}',
                                            },
                                        )
                                            .then((response) => response.json())
                                            .then((data) => {
                                                //Loop through every order of every route to assign the right orders to the right couriers
                                                data.routes.forEach((route) => {
                                                    for (
                                                        let i = 0;
                                                        i < route.steps.length;
                                                        i++
                                                    ) {
                                                        //To prevent updating the same order twice, we ignore steps of type 'start' and 'delivery'
                                                        if (
                                                            route.steps[i]
                                                                .type ===
                                                            'pickup'
                                                        )
                                                            Order.update(
                                                                {
                                                                    status: 'TRANSIT',
                                                                    courier_id:
                                                                        route.vehicle,
                                                                },
                                                                {
                                                                    where: {
                                                                        id: route
                                                                            .steps[
                                                                            i
                                                                        ].id,
                                                                    },
                                                                },
                                                            )
                                                                .then(
                                                                    (
                                                                        rowsAffected,
                                                                    ) => {
                                                                        console.log(
                                                                            `Updated order ${route.steps[i].id}. ${rowsAffected} rows affected.`,
                                                                        );
                                                                    },
                                                                )
                                                                .catch(
                                                                    (err) => {
                                                                        console.log(
                                                                            `Could not update order ${route.steps[i].id}. Error message: ${err}`,
                                                                        );
                                                                    },
                                                                );
                                                    }
                                                });
                                            })
                                            .catch((err) => {
                                                console.error(err);
                                            });
                                    })
                                    .catch((err) => {
                                        console.error(
                                            `Failed to retrieve couriers from database. Errormessage: ${err}`,
                                        );
                                    });
                            })
                            .catch((err) => {
                                console.error(
                                    `Failed to retrieve orders from database. Errormessage: ${err}`,
                                );
                            });
                    },
                    {
                        scheduled: true,
                    },
                );

            const formattedEndTime = moment(timeWindow.end, 'HH:mm:ss').format(
                's m H',
            );
            const today = moment().format('YYYY-MM-DD');

            console.log(formattedEndTime);

            cron.schedule(
                `${formattedEndTime} * * ${dayOfTheWeek}`,
                () => {
                    Order.update(
                        { status: 'FAILED', courier_id: null },
                        {
                            where: {
                                delivery_date: today,
                                status: { [Op.ne]: 'DELIVERED' },
                            },
                        },
                    )
                        .then((rowsUpdated) => {
                            console.log(
                                `Updated ${rowsUpdated} orders to 'FAILED' status.`,
                            );
                        })
                        .catch((err) =>
                            console.error(`Caught error in trying to update the
                     status of orders to 'FAILED'. Errormessage: ${err}`),
                        );
                },
                {
                    scheduled: true,
                },
            );
        }
    });
});

//Event handler that is triggered when a new same-day-delivery has been
//requested for an order.
onSameDayDelivery((orderId) => {
    //Add the order to the hourly cron-job loop
    sameDayDeliveryQueue.push(Number(orderId));
    console.log('added ID: ' + orderId);
});

onOrderStatusChange((id, status) => {
    if (sameDayDeliveryQueue.includes(Number(id)) && status === 'READY') {
        initiateOrderRequestCycle(id);
    }
});

router.put('/submitSpontaneousDeliveryResponse', (req, res) => {
    const pushMessageData = req.body.data;

    if (req.body.answer === 'accepted') {
        //Assign the order to the user who has accepted
        Order.update(
            { courier_id: req.user.id },
            { where: { id: pushMessageData.order.id } },
        )
            .then((affectedRows) => {
                console.log(
                    `Updated order ${pushMessageData.order.id}. ${affectedRows} rows affected.`,
                );
            })
            .catch((err) => {
                console.error(`Could not update order. Error message: ${err}`);
            });

        //Remove the order from the sameDayDeliveryQueue
        sameDayDeliveryQueue.forEach((sameDayDelivery, index) => {
            if (sameDayDelivery === pushMessageData.order.id)
                sameDayDeliveryQueue.splice(index, 1);
        });
    } else if (req.body.answer === 'denied') {
        console.log(`RECEIVED DENIED MESSAGE!\nFrom: ${req.user.id}`);

        pushMessageData.courierQueue.shift();

        //In case there are no more available couriers to send the message to, simply return.
        //FYI: The hourly cronjob will (eventually) take care of this order
        if (!pushMessageData.courierQueue.length) return;

        //Try another courier
        //Retrieve the courier next in the queue for this order
        let nextQueuedCourier;
        nextQueuedCourier = pushMessageData.courierQueue[0];

        console.log(`Next queued courier: ${nextQueuedCourier}`);

        //Find the courier among active couriers, and take its subscription.
        let courierSubscription;
        activeCouriers.forEach((courier) => {
            if (courier.id === nextQueuedCourier) {
                courierSubscription = courier.subscription;
            }
        });

        //Send the notification using web-push. The same payload is forwarded as taken
        //from the push message that was sent to the previous client.
        web_push
            .sendNotification(
                courierSubscription,
                JSON.stringify(pushMessageData),
            )
            .catch((err) =>
                console.error(`Could not send notification: ${err}`),
            );
    }
    res.status(200).json();
});

router.get('/:longitude/:latitude', (req, res) => {
    //Pak alle orders van vandaag die bij deze koerier horen
    Order.findAll({
        where: {
            courier_id: req.user.id,
            delivery_date: moment().format('YYYY-MM-DD'),
        },
        include: [
            {
                model: User,
                as: 'userCreated',
                required: true,
                include: [
                    {
                        model: Company,
                        as: 'company',
                        required: true,
                        include: [
                            { model: Location, as: 'location', required: true },
                        ],
                    },
                ],
            },
            {
                model: User,
                as: 'courier',
                required: true,
                include: [
                    { model: WeekSchedule, as: 'schedule', required: true },
                ],
            },
        ],
    })
        .then((orders) => {
            const ordersNotPickedUp = [];
            const ordersInTransit = [];
            orders.forEach((order) => {
                if (order.getDataValue('status') === 'READY')
                    ordersNotPickedUp.push(order);
                else if (order.getDataValue('status') === 'TRANSIT')
                    ordersInTransit.push(order);
            });

            const shipments = convertOrdersToShipments(ordersNotPickedUp);
            const jobs = convertOrdersToJobs(ordersInTransit);

            const userCoordinates = [
                Number(req.params.longitude),
                Number(req.params.latitude),
            ];

            const currentDayOfTheWeek = moment().format('dddd').toLowerCase();
            //We know every order has the same courier, so we just take the first one.
            const courierWeekSchedule =
                orders[0].getDataValue('courier').schedule;
            let courierDaySchedule;

            switch (currentDayOfTheWeek) {
                case 'monday':
                    courierDaySchedule = courierWeekSchedule.monday;
                    break;
                case 'tuesday':
                    courierDaySchedule = courierWeekSchedule.tuesday;
                    break;
                case 'wednesday':
                    courierDaySchedule = courierWeekSchedule.wednesday;
                    break;
                case 'thursday':
                    courierDaySchedule = courierWeekSchedule.thursday;
                    break;
                case 'friday':
                    courierDaySchedule = courierWeekSchedule.friday;
                    break;
                case 'saturday':
                    courierDaySchedule = courierWeekSchedule.saturday;
                    break;
                case 'sunday':
                    courierDaySchedule = courierWeekSchedule.sunday;
                    break;
            }

            const beginWorkDay = require('../../util').getTimestampInSeconds(
                courierDaySchedule.start,
            );
            const endWorkDay = require('../../util').getTimestampInSeconds(
                courierDaySchedule.end,
            );

            const currentTimeInSeconds = moment().diff(
                moment().startOf('day'),
                'seconds',
            );

            const working_hours = [
                Math.max(
                    beginWorkDay,
                    Math.min(currentTimeInSeconds, endWorkDay),
                ),
                endWorkDay,
            ];
            const vehicle = {
                id: req.user.id,
                profile: 'cycling-regular',
                start: userCoordinates,
                capacity: [4],
                skills: [1],
                time_window: working_hours, //[0, 80000]
            };

            fetch('https://api.openrouteservice.org/optimization', {
                method: 'POST',
                headers: {
                    Accept: 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
                    Authorization: process.env.ORS_API_KEY,
                    'Content-Type': 'application/json; charset=utf-8',
                },
                body:
                    '{"shipments": ' +
                    JSON.stringify(shipments) +
                    ', ' +
                    '"jobs": ' +
                    JSON.stringify(jobs) +
                    ',' +
                    '"vehicles": ' +
                    JSON.stringify([vehicle]) +
                    '}',
            })
                .then((response) => response.json())
                .then((data) => {
                    console.log(data);

                    orders.forEach((order) => {
                        //converteer het gewicht van elke order naar de beste maat
                        let value = convert(order.weight).from('g').toBest();
                        order.weight = `${Math.round(value.val)} ${value.unit}`;

                        // Format the created_at date
                        order.date = moment(order.created_at).format(
                            'YYYY-MM-DD',
                        );
                    });

                    const checkpoints = [];
                    if (data.routes.length) {
                        data.routes[0].steps.forEach((step) => {
                            //In case the type equals 'job', override that as a 'delivery'
                            orders.forEach((order) => {
                                if (
                                    order.getDataValue('id') === step.id &&
                                    step.type !== 'start'
                                ) {
                                    step.type =
                                        step.type === 'pickup'
                                            ? 'pickup'
                                            : 'delivery';
                                    const isPickup = step.type === 'pickup';
                                    console.log(step);

                                    //If its a pickup, add a location object with the company location data. Otherwise,
                                    //add a location object with the order/destination location data.

                                    let rawPickUpLocation =
                                        order.getDataValue('userCreated')
                                            .company.location;

                                    let checkpointLocation = isPickup
                                        ? {
                                              address: `${rawPickUpLocation.street} ${rawPickUpLocation.house_number}`,
                                              city: rawPickUpLocation.city,
                                              postal_code:
                                                  rawPickUpLocation.postal_code,
                                              country:
                                                  rawPickUpLocation.country,
                                          }
                                        : {
                                              address: `${order.getDataValue(
                                                  'street',
                                              )} ${order.getDataValue(
                                                  'house_number',
                                              )}`,
                                              city: order.getDataValue('city'),
                                              postal_code:
                                                  order.getDataValue(
                                                      'postal_code',
                                                  ),
                                              country:
                                                  order.getDataValue('country'),
                                          };

                                    checkpoints.push({
                                        location: checkpointLocation,
                                        type: step.type,
                                        order_id: step.id,
                                        time: moment(
                                            (step.arrival - 3600) * 1000,
                                        ).format('HH:mm:ss'),
                                    });
                                }
                            });
                        });
                    }

                    res.status(200).json({
                        checkpoints,
                        user: req.user,
                        total_duration: data.duration,
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json(err);
                });
        })
        .catch((err) => {
            console.error(
                `Failed to retrieve orders from database. Errormessage: ${err}`,
            );
        });
});

module.exports = router;
