const router = require('express').Router();
const Format = require('../../models/format');
const passport = require('../../auth/passport');
const auth = require('../../middleware/auth');
const pagination = require('../../middleware/pagination');
const ordering = require('../../middleware/ordering');
const convert = require('convert-units');
const searching = require('../../middleware/searching');
const { searchQueryToWhereClause } = require('../../util');
const moment = require('moment');
const { User, Company, Location, WeekSchedule, Order, Organisation } = require('../../models');
const { Op } = require('sequelize');
const sequelize = require('../../db/connection');

router.get('/', auth(true), (req, res) => {
    res.redirect('/dashboard/overview');
});

router.get(
    '/overview',
    auth(true),
    pagination([25, 50, 100]),
    ordering('id', 'desc'),
    searching,
    async (req, res) => {
        // Get the orders with the calculated offset, limit for pagination and details about the sorting order
        const orders =
            req.user.role === 'COURIER'
                ? await Order.findAll({
                      where: {
                          courier_id: req.user.getDataValue('id'),
                          delivery_date: moment().format('YYYY-MM-DD'),
                      },
                      include: {
                          model: User,
                          as: 'courier',
                          required: true,
                          include: {
                              model: WeekSchedule,
                              as: 'schedule',
                              required: true,
                          },
                      },
                  })
                : await Order.findAll({
                      offset: req.offset,
                      limit: req.limit,
                      order: [[req.sort, req.order]],
                      where: searchQueryToWhereClause(req.search, ['id', 'weight', 'status']),
                  });
        /**
         * Gets the money donated from this month of the current company
         * @param {number} companyId the id of the company
         * @returns the money donated
         */
        const getDonatedMoney = async (companyId) => {
            let donated = await sequelize.query(
                `
                SELECT users.company_id AS company_id, SUM(donations.amount) AS collected
                FROM users
                INNER JOIN orders
                ON users.id = orders.created_by
                INNER JOIN donations
                ON orders.id = donations.order_id
                WHERE users.company_id = ${companyId} && MONTH(donations.created_at) = MONTH(CURRENT_DATE()) && YEAR(donations.created_at) = YEAR(CURRENT_DATE())
                GROUP BY users.company_id`,
                { type: sequelize.QueryTypes.SELECT },
            );

            return donated.length !== 0 ? donated[0].collected : 0;
        };

        //Count specific values from database
        const ordersAmount = await Order.count();
        const deliverdAmount = await Order.count({
            where: {
                status: 'DELIVERED',
            },
        });
        const donatedAmount =
            req.user.role === 'SHOP_OWNER' ? await getDonatedMoney(req.user.companyId) : 0;

        //We first assume the courier doesn't work today
        let daySchedule = null;

        let chart,
            meiDelivered,
            juniDelivered,
            aprilSorting,
            meiSorting,
            juniSorting,
            aprilReady,
            meiReady,
            juniReady,
            aprilTransit,
            meiTransit,
            juniTransit,
            aprilFailed,
            meiFailed,
            juniFailed;

        if (req.user.role === 'COURIER') {
            const currentDayOfTheWeek = moment().format('dddd').toLowerCase();
            //We know every order has the same courier, so we just take the first one.
            const user = await User.findOne({
                where: { id: req.user.id },
                include: {
                    model: WeekSchedule,
                    as: 'schedule',
                    required: true,
                },
            }); //orders[0].getDataValue('courier').schedule;
            const courierWeekSchedule = user.getDataValue('schedule');

            switch (currentDayOfTheWeek) {
                case 'monday':
                    daySchedule = courierWeekSchedule.monday;
                    break;
                case 'tuesday':
                    daySchedule = courierWeekSchedule.tuesday;
                    break;
                case 'wednesday':
                    daySchedule = courierWeekSchedule.wednesday;
                    break;
                case 'thursday':
                    daySchedule = courierWeekSchedule.thursday;
                    break;
                case 'friday':
                    daySchedule = courierWeekSchedule.friday;
                    break;
                case 'saturday':
                    daySchedule = courierWeekSchedule.saturday;
                    break;
                case 'sunday':
                    daySchedule = courierWeekSchedule.sunday;
                    break;
            }
        } else {
            delivered = await Order.findAll(
                {
                    where: { status: 'DELIVERED' },
                    attributes: [
                        [Order.sequelize.fn('MONTH', Order.sequelize.col('created_at')), 'month'],
                        [Order.sequelize.fn('COUNT', Order.sequelize.col('id')), 'orders'],
                    ],
                    group: [Order.sequelize.fn('MONTH', Order.sequelize.col('created_at'))],
                },
                {
                    where: {
                        [Order.sequelize.fn('YEAR', Order.sequelize.col('created_at'))]:
                            moment().format('YYYY'),
                    },
                },
            );

            console.log(delivered);

            chart = [];

            for (let i = 0; i < 11; i++) {
                const month = delivered.find((x) => x.getDataValue('month') === i);

                chart.push(month ? month.getDataValue('orders') : 0);
            }

            totaalOmzet = await Order.findAll(
                {
                    attributes: [
                        [Order.sequelize.fn('MONTH', Order.sequelize.col('created_at')), 'month'],
                        [Order.sequelize.fn('SUM', Order.sequelize.col('price')), 'omzet'],
                    ],
                    group: [Order.sequelize.fn('MONTH', Order.sequelize.col('created_at'))],
                },
                {
                    where: {
                        [Order.sequelize.fn('YEAR', Order.sequelize.col('created_at'))]:
                            moment().format('YYYY'),
                    },
                },
            ).catch((err) => {});

            /* meiDelivered = await Order.count({
                where: {
                    status: 'DELIVERED',
                    updated_at: {
                        [Op.between]: [
                            new Date(Date.parse('2022-05-01 23:00:00')),
                            new Date(Date.parse('2022-05-31 00:00:00')),
                        ],
                    },
                },
            });
            juniDelivered = await Order.count({
                where: {
                    status: 'DELIVERED',
                    updated_at: {
                        [Op.between]: [
                            new Date(Date.parse('2022-06-01 23:00:00')),
                            new Date(Date.parse('2022-06-31 00:00:00')),
                        ],
                    },
                },
            });
            aprilSorting = await Order.count({
                where: {
                    status: 'SORTING',
                    updated_at: {
                        [Op.between]: [
                            new Date(Date.parse('2022-04-01 23:00:00')),
                            new Date(Date.parse('2022-04-31 00:00:00')),
                        ],
                    },
                },
            });
            meiSorting = await Order.count({
                where: {
                    status: 'SORTING',
                    updated_at: {
                        [Op.between]: [
                            new Date(Date.parse('2022-05-01 23:00:00')),
                            new Date(Date.parse('2022-05-31 00:00:00')),
                        ],
                    },
                },
            });
            juniSorting = await Order.count({
                where: {
                    status: 'SORTING',
                    updated_at: {
                        [Op.between]: [
                            new Date(Date.parse('2022-06-01 23:00:00')),
                            new Date(Date.parse('2022-06-31 00:00:00')),
                        ],
                    },
                },
            });
            aprilReady = await Order.count({
                where: {
                    status: 'READY',
                    updated_at: {
                        [Op.between]: [
                            new Date(Date.parse('2022-04-01 23:00:00')),
                            new Date(Date.parse('2022-04-31 00:00:00')),
                        ],
                    },
                },
            });
            meiReady = await Order.count({
                where: {
                    status: 'READY',
                    updated_at: {
                        [Op.between]: [
                            new Date(Date.parse('2022-05-01 23:00:00')),
                            new Date(Date.parse('2022-05-31 00:00:00')),
                        ],
                    },
                },
            });
            juniReady = await Order.count({
                where: {
                    status: 'READY',
                    updated_at: {
                        [Op.between]: [
                            new Date(Date.parse('2022-06-01 23:00:00')),
                            new Date(Date.parse('2022-06-31 00:00:00')),
                        ],
                    },
                },
            });
            meiTransit = await Order.count({
                where: {
                    status: 'TRANSIT',
                    updated_at: {
                        [Op.between]: [
                            new Date(Date.parse('2022-05-01 23:00:00')),
                            new Date(Date.parse('2022-05-31 00:00:00')),
                        ],
                    },
                },
            });
            aprilTransit = await Order.count({
                where: {
                    status: 'TRANSIT',
                    updated_at: {
                        [Op.between]: [
                            new Date(Date.parse('2022-04-01 23:00:00')),
                            new Date(Date.parse('2022-04-31 00:00:00')),
                        ],
                    },
                },
            });
            juniTransit = await Order.count({
                where: {
                    status: 'TRANSIT',
                    updated_at: {
                        [Op.between]: [
                            new Date(Date.parse('2022-06-01 23:00:00')),
                            new Date(Date.parse('2022-06-31 00:00:00')),
                        ],
                    },
                },
            });
            aprilFailed = await Order.count({
                where: {
                    status: 'FAILED',
                    updated_at: {
                        [Op.between]: [
                            new Date(Date.parse('2022-04-01 23:00:00')),
                            new Date(Date.parse('2022-04-31 00:00:00')),
                        ],
                    },
                },
            });
            meiFailed = await Order.count({
                where: {
                    status: 'FAILED',
                    updated_at: {
                        [Op.between]: [
                            new Date(Date.parse('2022-05-01 23:00:00')),
                            new Date(Date.parse('2022-05-31 00:00:00')),
                        ],
                    },
                },
            });
            juniFailed = await Order.count({
                where: {
                    status: 'FAILED',
                    updated_at: {
                        [Op.between]: [
                            new Date(Date.parse('2022-06-01 23:00:00')),
                            new Date(Date.parse('2022-06-31 00:00:00')),
                        ],
                    },
                },
            });*/
        }

        orders.forEach((order) => {
            //converteer het gewicht van elke order naar de beste maat
            let value = convert(order.weight).from('g').toBest();

            order.weight = `${Math.round(value.val)} ${value.unit}`;

            // Format the created_at date
            order.date = moment(order.created_at).format('YYYY-MM-DD');
        });

        const courierRenderData = {
            title: 'Overzicht - Dashboard',
            orders,
            daySchedule,
            order: req.order,
            user: req.user,
        };

        const shopOwnerRenderData = {
            title: 'Overzicht - Dashboard',
            orders,
            sort: req.sort,
            order: req.order,
            limit: req.limit,
            user: req.user,
            search: req.search,
            page: req.page,
            ordersAmount,
            deliverdAmount,
            donatedAmount,
            chart,
            meiDelivered,
            juniDelivered,
            aprilSorting,
            meiSorting,
            juniSorting,
            aprilReady,
            meiReady,
            juniReady,
            aprilTransit,
            meiTransit,
            juniTransit,
            aprilFailed,
            meiFailed,
            juniFailed,
        };

        // Render the page, pass on the order array
        res.render(
            req.user.role === 'COURIER' ? 'dashboard/courier/overview' : 'dashboard/overview',
            req.user.role === 'COURIER' ? courierRenderData : shopOwnerRenderData,
        );
    },
);

router.get('/signin', auth(false), (req, res) => {
    res.render('dashboard/signin', {
        title: 'Sign In - Dashboard',
    });
});

router.get('/signup', auth(false), (req, res) => {
    const { code } = req.query;

    const isCodeValid = code ? true : false;

    res.render('dashboard/signup', {
        title: 'Sign Up - Dashboard',
        code,
        isCodeValid,
    });
});

// Authentication via Passport.js
router.post(
    '/signin',
    auth(false),
    passport.authenticate('local', {
        failureRedirect: '/dashboard/signin',
    }),
    (req, res) => {
        // Saving the session before redirecting,
        // otherwise req#isAuthenticated() returns
        // null. Not sure why that is, but it has
        // been an issue since 2015.
        req.session.save(() => {
            res.redirect('/dashboard');
        });
    },
);

router.get('/signout', auth(true), (req, res) => {
    req.logout();
    res.redirect('/');
});

/**
 * Render the package size page
 */
router.get('/settings', async (req, res) => {
    const formats = await Format.findAll();
    const user = await User.findByPk(req.user.id);

    if (req.user.role === 'COURIER') {
        const schedule = await WeekSchedule.findByPk(user.scheduleId);

        // we assume that there is one organisation since its just us
        const organisation = await Organisation.findOne();
        const organisationSchedule = await WeekSchedule.findByPk(
            organisation.operating_schedule_id,
        );
        const location = await Location.findByPk(user.locationId);

        res.render('dashboard/courier/settings', {
            title: 'Settings',
            user,
            schedule,
            organisationSchedule,
            location,
        });
    } else {
        const company = await Company.findByPk(req.user.companyId);
        const location = await Location.findByPk(company.location_id);

        res.render('dashboard/settings', {
            title: 'Package sizes',
            formats,
            user,
            company,
            location,
        });
    }
});

router.use('/orders', require('./orders'));
router.use('/scan', require('./scanner'));
router.use('/users', require('./users'));
router.use('/goals', require('./goals'));

module.exports = router;
