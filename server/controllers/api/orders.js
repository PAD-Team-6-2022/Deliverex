const router = require('express').Router();
const {
    Order,
    Format,
    User,
    Location,
    Company,
    Goal,
    Donation,
} = require('../../models');
const Organisation = require('../../models/organisation');
const WeekSchedule = require('../../models/week_schedule');
const auth = require('../../middleware/auth');
const moment = require('moment');
const fetch = require('node-fetch');
const ejs = require('ejs');
const path = require('path');
const { addOrderToDeliveryQueue } = require('../../util');

router.delete('/:id', (req, res) => {
    Order.destroy({ where: { id: req.params.id } })
        .then(() => {
            res.status(200).json({
                message: 'Successfully deleted order',
            });
        })
        .catch((err) => {
            res.status(500).json({
                message: `Something went wrong while trying to delete the order: ${err}`,
            });
        });
});

router.delete('/settings/:id', (req, res) => {
    Format.destroy({ where: { id: req.params.id } })
        .then(() => {
            res.status(200).json({
                message: 'Successfully deleted format',
            });
        })
        .catch((err) => {
            res.status(500).json({
                message: `Something went wrong while trying to delete the format: ${err}`,
            });
        });
});

router.get('/', (req, res) => {
    Order.findAll()
        .then((orders) => {
            res.status(200).json(orders);
        })
        .catch((err) => {
            res.status(500).json(err);
        });
});

/**
 * Get the id of the company the order belongs to
 *
 * @param {number} orderId the id of the order
 * @returns The company id of to what the order belongs to
 */
const getCompanyId = async (orderId) => {
    const company = await Order.findByPk(orderId, {
        include: [
            {
                model: User,
                as: 'userCreated',
                include: [
                    {
                        model: Company,
                        as: 'company',
                    },
                ],
            },
        ],
    });

    return company.userCreated.company.id;
};

router.post('/', (req, res) => {
    const sendEmail = async (id) => {
        let emailTemplate = await ejs.renderFile(
            path.resolve(__dirname, '../../views/mail/template.ejs'),
            {
                link: `http://${req.rawHeaders[1]}/track/${req.body.postal_code}/${id}`,
            },
        );

        await fetch(`https://api.hbo-ict.cloud/mail`, {
            method: 'POST',
            headers: {
                Authorization: 'Bearer pad_rit_6.o8ZLxKESVnaVSVQs',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: {
                    name: 'Team 6',
                    address: 'team6@hbo-ict.cloud',
                },
                to: [
                    {
                        name: '',
                        address: req.body.email,
                    },
                ],
                subject: 'Track & Trace',
                html: emailTemplate,
            }),
        });
    };

    /**
     * donate the set comapany percentage of the order price to the current goal
     *
     * @param {Object} order donation of the order
     */
    const donateMoney = async (order) => {
        // Get the current goal(the goal that's being collected for)
        const currentGoal = await Goal.findOne({
            where: {
                status: 'CURRENT',
            },
        });

        const company = await Company.findByPk(await getCompanyId(order.id));

        await Donation.create({
            amount: parseFloat(
                ((order.price / 100) * company.percentageToGoal).toFixed(2),
            ),
            goalId: currentGoal.id,
            orderId: order.id,
        });
    };

    let pickup_status = req.body.is_pickup != null;

    //TODO: Remove this hard-coded deliveryDate with one sent by the front-end
    req.body.deliveryDate = moment().format('YYYY-MM-DD');

    Order.create({
        status: 'SORTING',
        email: req.body.email,
        weight: req.body.weight,
        created_at: Date.now(),
        street: req.body.street,
        house_number: req.body.house_number,
        postal_code: req.body.postal_code,
        city: req.body.city,
        country: req.body.country,
        format_id: req.body.format_id,
        is_pickup: pickup_status,
        updated_at: Date.now(),
        price: req.body.price,
        created_by: req.user.id,
        coordinates: {
            type: 'Point',
            coordinates: Object.values(
                JSON.parse(req.body.coordinates),
            ).reverse(),
        },
        delivery_date: req.body.deliveryDate,
    })
        .then(async (order) => {
            //Handle the way this order should be treated based on whether the 'freelanceMode'
            //option is currently being used.
            Organisation.findOne().then((organisation) => {
                const freelanceMode =
                    organisation.getDataValue('freelanceMode');
                if (freelanceMode)
                    addOrderToDeliveryQueue(order.getDataValue('id'));
                else {
                    //Planned mode
                    if (
                        order.getDataValue('delivery_date') !==
                        moment().format('YYYY-MM-DD')
                    )
                        return;

                    WeekSchedule.findOne({
                        where: {
                            id: organisation.getDataValue(
                                'operating_schedule_id',
                            ),
                        },
                    }).then((organisationSchedule) => {
                        const currentDay = moment()
                            .format('dddd')
                            .toLowerCase();
                        const todaySchedule =
                            organisationSchedule.getDataValue(currentDay);

                        //In case the morning cron-job has already fired, add it to the same-day-delivery queue
                        if (
                            moment().isAfter(
                                moment(todaySchedule.start, 'HH:mm:ss'),
                            )
                        ) {
                            addOrderToDeliveryQueue(order.getDataValue('id'));
                        }
                    });
                }
            });

            await donateMoney(order);

            sendEmail(order.id);
            res.status(200).json({
                order,
                message: `order ${order.id} created`,
            });
        })
        .catch((err) => {
            res.status(500).json(err);
            console.log(err);
        });
});

router.post('/edit', async (req, res) => {
    /**
     * Update the donation for the given order
     *
     * @param {number} orderId The id of the number
     * @param {number} orderPrice The price of the order
     * @returns the donation that is made
     */
    const updateDonation = async (orderId, orderPrice) => {
        const company = await Company.findByPk(await getCompanyId(orderId));

        const donation = Donation.update(
            {
                amount: parseFloat(
                    ((orderPrice / 100) * company.percentageToGoal).toFixed(2),
                ),
            },
            {
                where: {
                    orderId,
                },
            },
        );

        return donation;
    };

    let pickup_status = req.body.is_pickup != null;

    Order.update(
        {
            weight: req.body.weight,
            email: req.body.email,
            street: req.body.street,
            house_number: req.body.house_number,
            postal_code: req.body.postal_code,
            city: req.body.city,
            formatId: req.body.format_id,
            status: req.body.status,
            is_pickup: pickup_status,
            updated_at: Date.now(),
            price: req.body.price,
            // coordinates: req.body.coordinates
        },
        { where: { id: req.body.id } },
    )
        .then(async (affectedRows) => {
            await updateDonation(req.body.id, req.body.price);
            res.status(200).json({
                message: `${affectedRows} rows updated`,
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json(err);
        });
});

router.put('/editFormat/:id', (req, res) => {
    Format.update(
        {
            height: req.body.height,
            length: req.body.length,
            width: req.body.width,
            nameformat: req.body.nameformat,
        },
        { where: { id: req.params.id } },
    )
        .then((affectedRows) => {
            res.status(200).json({
                message: `${affectedRows} rows updated`,
            });
        })
        .catch((err) => {
            res.status(500).json(err);
        });
});

router.post('/setting', auth(true), (req, res) => {
    Format.create({
        length: req.body.length,
        height: req.body.height,
        nameformat: req.body.name,
        width: req.body.width,
        userId: req.user.id,
    })
        .then((format) => {
            res.status(200).json({
                format,
                message: `format ${format.id} created`,
            });
        })
        .catch((err) => {
            res.status(500).json(err);
        });
});

router.put('/editAccount/:id', (req, res) => {
    console.log(req);
    User.update(
        {
            username: req.body.username,
            email: req.body.email,
        },
        { where: { id: req.params.id } },
    )
        .then((affectedRows) => {
            res.status(200).json({
                message: `${affectedRows} rows updated`,
            });
        })
        .catch((err) => {
            res.status(500).json(err);
        });
});

router.put('/editDoelPercentage/:id', (req, res) => {
    Company.update(
        {
            percentageToGoal: req.body.percentage,
        },
        { where: { id: req.params.id } },
    )
        .then((affectedRows) => {
            res.status(200).json({
                message: `${affectedRows} rows updated`,
            });
        })
        .catch((err) => {
            res.status(500).json(err);
        });
});

router.put('/editStore/:id', (req, res) => {
    Company.update(
        {
            name: req.body.name,
            email: req.body.email,
        },
        { where: { id: req.params.id } },
    )
        .then((affectedRows) => {
            res.status(200).json({
                message: `${affectedRows} rows updated`,
            });
        })
        .catch((err) => {
            res.status(500).json(err);
        });

    Location.update(
        {
            streethouse_number: req.body.streethouseNumber,
            postal_code: req.body.postalCode,
            city: req.body.city,
            country: req.body.country,
        },
        { where: { location_id: req.params.id } },
    );
});

router.get('/deliveryDates', (req, res) => {
    Organisation.findOne().then((organisation) => {
        const freelanceMode = organisation.getDataValue('freelanceMode');

        WeekSchedule.findOne({
            where: { id: organisation.getDataValue('operating_schedule_id') },
        }).then((organisationSchedule) => {
            const currentDay = moment().format('dddd').toLowerCase();
            const todaySchedule = organisationSchedule.getDataValue(currentDay);

            const sameDayDeliverable = moment().isBefore(
                moment(todaySchedule.end, 'HH:mm:ss'),
            );

            const availableDays = {
                monday: organisationSchedule.getDataValue('monday') !== null,
                tuesday: organisationSchedule.getDataValue('tuesday') !== null,
                wednesday:
                    organisationSchedule.getDataValue('wednesday') !== null,
                thursday:
                    organisationSchedule.getDataValue('thursday') !== null,
                friday: organisationSchedule.getDataValue('friday') !== null,
                saturday:
                    organisationSchedule.getDataValue('saturday') !== null,
                sunday: organisationSchedule.getDataValue('sunday') !== null,
            };

            if (freelanceMode) {
                let deliveryMessage;
                if (sameDayDeliverable)
                    deliveryMessage = `The order is expected to be delivered today.`;
                else {
                    //Bereken wat de eerstvolgende dag is waarop het kan worden afgeleverd, en informeer de
                    //gebruiker daarvan.
                    let availableDaysEntries = Object.entries(availableDays);
                    const daysBefore = availableDaysEntries.slice(
                        0,
                        Object.keys(availableDays).indexOf(currentDay),
                    );
                    availableDaysEntries.splice(
                        0,
                        Object.keys(availableDays).indexOf(currentDay) + 1,
                    );
                    availableDaysEntries =
                        availableDaysEntries.concat(daysBefore);

                    for (let i = 0; i < availableDaysEntries.length; i++) {
                        if (availableDaysEntries[i][1] !== false) {
                            deliveryMessage = `The order is expected to be delivered on ${availableDaysEntries[i][0]}`;
                            break;
                        }
                    }
                }
                res.status(200).json({ schedulable: false, deliveryMessage });
            } else {
                //Note: if the current day is marked 'true' in 'availabledays', it does not
                //mean the same as a same day delivery being possible. You have to specifically
                //use the 'sameDayDelivery' boolean to read out whether it's possible.
                const schedulingData = {
                    sameDayDelivery: sameDayDeliverable,
                    availableDays,
                };
                res.status(200).json({ schedulable: true, schedulingData });
            }
        });
    });
});

/**
 * Retrieves the order associated with a given ID. Since it is assumed that
 * request will come from the scanning page, the server will check whether
 * this order is being scanned by the right courier for safety sake.
 */
router.get('/:id/scan', auth(true), async (req, res) => {
    const { id } = req.params;

    await Order.findByPk(id)
        .then((order) => {
            res.json({
                order: order,
                isNotAuthorized:
                    order.getDataValue('courier_id') !== req.user.id,
            });
        })
        .catch((error) => {
            res.status(404).json(
                `Could not find order with ID ${id}. Error: ${error}`,
            );
        });
});

/**
 * Updates the 'courier_id' attribute of an order to the given ID of the courier.
 * In case the order could not be found or another error was caught, the server
 * will respond with the appropriate error messages.
 */
router.put('/:id/scan', auth(true), (req, res) => {
    Order.findByPk(req.body.id)
        .then((order) => {
            let newStatus;
            if (order.status === 'SORTING') newStatus = 'READY';
            else if (order.status === 'READY') newStatus = 'TRANSIT';
            else if (order.status === 'TRANSIT') newStatus = 'DELIVERED';

            Order.update({ status: newStatus }, { where: { id: req.body.id } })
                .then((data) => {
                    res.sendStatus(200);
                })
                .catch((error) => {
                    console.error(
                        `Could not assign order to courier. Error message: ${error}`,
                    );
                    res.sendStatus(500);
                });
        })
        .catch((error) => {
            res.status(404).json(
                `Could not find order with ID ${req.body.id}. Error: ${error}`,
            );
        });
});

/**
 * Updates the status of an order from 'TRANSIT' to 'DELIVERED' and
 * reloads the page.
 */
router.post('/:id/scan', async (req, res) => {
    Order.update(
        { status: 'DELIVERED' },
        { where: { id: req.body.selectedOrder } },
    )
        .then(() => {
            res.redirect('/dashboard/overview');
        })
        .catch((error) => {
            res.status(500).json(
                `Caught error while updating delivery status: ${error}`,
            );
        });
});

module.exports = router;
