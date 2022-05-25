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

router.post('/add', auth(true), async (req, res) => {
    const { type, role, username, email, password, confirm_password, notify } =
        req.body;
    const errors = [];

    if (password !== confirm_password) errors.push("Passwords don't match");
    if (type === 'create' && !password) errors.push('Password is required');

    try {
        const user = await User.create({
            username,
            email,
            role,
            // Only insert the password if the user decided
            // to set a password for the user himself instead
            // of letting the new user decide for themselves.
            password: type === 'create' ? password : null,
        });
    } catch (err) {
        errors.push(err);
    }

    if (errors.length > 0) {
        req.flash('errors', errors);

        console.log(errors);
    }
});

module.exports = router;
