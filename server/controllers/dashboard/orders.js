const auth = require('../../middleware/auth');
const allowedTypes = require('../../middleware/allowedTypes');
const { Order, Format } = require('../../models');
const convert = require('convert-units');
const { searchQueryToWhereClause } = require('../../util');
const searching = require('../../middleware/searching');
const ordering = require('../../middleware/ordering');
const pagination = require('../../middleware/pagination');
const moment = require('moment');

const router = require('express').Router();

router.get(
    '/',
    auth(true),
    pagination([25, 50, 100]),
    ordering('id', 'desc', ['id', 'weight', 'status', 'created_at']),
    searching,
    allowedTypes(['SHOP_OWNER', 'ADMIN']),
    async (req, res) => {
        const orders = await Order.findAll({
            offset: req.offset,
            limit: req.limit,
            order: [[req.sort, req.order]],
            where: searchQueryToWhereClause(req.search, ['id', 'weight', 'status']),
        });

        orders.forEach((order) => {
            //converteer het gewicht van elke order naar de beste maat
            let value = convert(order.weight).from('g').toBest();

            order.weight = `${Math.round(value.val)} ${value.unit}`;

            // Format the created_at date
            order.date = moment(order.created_at).format('YYYY-MM-DD');
        });

        res.render('dashboard/orders/list', {
            title: 'Orders - Dashboard',
            orders,
            sort: req.sort,
            order: req.order,
            limit: req.limit,
            user: req.user,
            search: req.search,
            page: req.page,
        });
    },
);

router.get(
    '/editFormat/:id',
    auth(true),
    allowedTypes(['ADMIN', 'SHOP_OWNER']),
    async (req, res) => {
        const format = await Format.findByPk(req.params.id);

        res.render('dashboard/orders/editFormat', {
            title: 'Edit Page- Formats',
            format,
        });
    },
);

/**
 * Route for rendering the order create page
 * 
 * This route adds a title and formats to the page
 */
router.get('/create', auth(true), allowedTypes(['SHOP_OWNER', 'ADMIN']),
    async (req, res) => {
    const formats = await Format.findAll({
        where: { userId: req.user.id },
    });

    res.render('dashboard/orders/create', {
        title: 'Create order - Dashboard',
        formats,
    });
});

/**
 * Route for rendering the order edit page
 * 
 * @param id order id
 */
router.get('/:id/edit', auth(true), allowedTypes(['SHOP_OWNER', 'ADMIN']),
    async (req, res) => {
    const { id } = req.params;
    const order = await Order.findByPk(id);

    const formats = await Format.findAll({
        where: { userId: req.user.id },
    });

    if (!order) {
        res.redirect('/dashboard/orders');
        return;
    }

    res.render('dashboard/orders/edit', {
        title: 'Edit order - Dashboard',
        order,
        formats,
    });
});

router.get('/:id', auth(true), allowedTypes(['ADMIN', 'SHOP_OWNER']),
    async (req, res) => {
    const { id } = req.params;
    const order = await Order.findByPk(id, { include: Format });

    // if no order is found redirect it to the dashboard overview
    if (!order) {
        res.redirect('/dashboard/overview');
        return;
    }

    // covert the weight to the best value "kg" or "g"
    const convertedWeight = convert(order.weight).from('g').toBest();
    order.weight = `${Math.round(convertedWeight.val)} ${convertedWeight.unit}`;

    // convert price int to euro
    order.price = new Intl.NumberFormat('nl-NL', {
        style: 'currency',
        currency: 'EUR',
    }).format(order.price);

    res.render('dashboard/orders/detail', {
        title: `Order #${id} - Dashboard`,
        id,
        order,
    });
});

module.exports = router;
