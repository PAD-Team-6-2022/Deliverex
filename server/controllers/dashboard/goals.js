const auth = require('../../middleware/auth');
const { Goal, Donation } = require('../../models');
const sequelize = require('sequelize');

const router = require('express').Router();

router.get('/', auth(true), async (req, res) => {
    const goals = await Goal.findAll({
        include: [Donation],
        attributes: {
            include: [
                [
                    sequelize.fn('sum', sequelize.col('donations.amount')),
                    'total_donated',
                ],
                [
                    sequelize.fn('count', sequelize.col('donations.id')),
                    'total_donations',
                ],
            ],
        },
        group: ['id'],
    });

    res.render('dashboard/goals/list', {
        title: 'Goals - Dashboard',
        goals,
    });
});

router.get('/:slug', auth(true), async (req, res) => {
    const { slug } = req.params;

    res.render('dashboard/goals/single', {
        title: `${slug} - Goal - Dashboard`,
    });
});

module.exports = router;
