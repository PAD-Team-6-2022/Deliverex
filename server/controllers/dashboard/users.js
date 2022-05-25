const auth = require('../../middleware/auth');
const ordering = require('../../middleware/ordering');
const pagination = require('../../middleware/pagination');
const searching = require('../../middleware/searching');
const { User } = require('../../models');
const { searchQueryToWhereClause } = require('../../util');

const router = require('express').Router();

router.get(
    '/',
    auth(true),
    pagination([25, 50, 100]),
    ordering('id', 'desc', ['id', 'email']),
    searching,
    async (req, res) => {
        const users = await User.findAll({
            offset: req.offset,
            limit: req.limit,
            order: [[req.sort, req.order]],
            where: searchQueryToWhereClause(req.search, ['id']),
        });

        res.render('dashboard/users/list', {
            title: 'Users - Dashboard',
            users,
            sort: req.sort,
            order: req.order,
            limit: req.limit,
            user: req.user,
            search: req.search,
            page: req.page,
        });
    },
);

router.get('/add', auth(true), async (req, res) => {
    res.render('dashboard/users/add', {
        title: 'Add User - Dashboard',
    });
});

module.exports = router;
