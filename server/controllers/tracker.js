const router = require('express').Router();
const { Order, Format, Vote, Goal, Donation } = require('../models/');
const sequelize = require("../db/connection");
const convert = require('convert-units');

/**
 * Render the homepage
 */
router.get('/', (req, res) => {
    res.render('home', { title: 'Homepage', toasters: req.flash('toasters') });
});

/**
 * Render tracker page for order with given id
 */
router.get('/track/:postal_code/:id', async (req, res) => {
    const { id, postal_code } = req.params;
    // find the one order with the given id and postal_code combination
    const order =  await Order.findOne({
        where: {
            id,
            postal_code,
        },
        include: [Format, Vote, Donation],
    });

    // if no order is found redirect with error toaster message
    if (!order) {
        const toasters = [
            {
                type: 'ERROR',
                message: "Oops! We couldn't find your package",
            },
        ];

        req.flash('toasters', toasters);

        req.session.save(() => {
            res.redirect('/');
        });

        return;
    }

    // get goals
    const goals = await getGoals(id);

    const convertedWeight = convert(order.weight).from('g').toBest();
    order.weight = `${Math.round(convertedWeight.val)} ${convertedWeight.unit}`;

    // convert price int to euro
    order.price = new Intl.NumberFormat('nl-NL', {
        style: 'currency',
        currency: 'EUR',
    }).format(order.price);

    res.render('tracker', {
        title: 'Track & Trace',
        order,
        currentGoal: goals.currentGoal,
        activeGoals: goals.activeGoals,
        votedGoal: goals.votedGoal,
    });
});

/**
 * Get all types of goals needed for the tracking page
 * 
 * @author Dylan Weijgertze
 * @param {number} id The id of the order you want the votedGoal for
 * @returns {Object} current goal, actively voted on goals and what goal is voted on in this order
 */
const getGoals = async (id) => {
    // Get the current goal(the goal that's being collected for) with the sum of donations
    const currentGoal = await Goal.findOne({
        where: {
            status: 'CURRENT',
        },
        include: [
            {
                model: Donation,
                attributes: [
                    [sequelize.fn('SUM', sequelize.col('donations.amount')), 'total']
                ],
                group: ['goal_id'],
            }
        ],
    });

    // Get the acive goals(the goal that's being voted on)
    const activeGoals = await Goal.findAll({
        limit: 2,
        where: {
            status: 'ACTIVE',
        },
    });

    // the goal that is voted on
    const votedGoal = await Vote.findOne({
        where: {
            orderId: id,
        },
        include: [Goal],
    });

    return {
        currentGoal,
        activeGoals,
        votedGoal,
    }
}

module.exports = router;
