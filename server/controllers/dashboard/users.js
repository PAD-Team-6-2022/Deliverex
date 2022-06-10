const allowedTypes = require('../../middleware/allowedTypes');
const auth = require('../../middleware/auth');
const ordering = require('../../middleware/ordering');
const pagination = require('../../middleware/pagination');
const searching = require('../../middleware/searching');
const { User } = require('../../models');
const { searchQueryToWhereClause } = require('../../util');

const router = require('express').Router();

/**
 * Used for the users table in the dashboard.
 * It implements a few middlewares including:
 * pagination, ordering, searching, and allowedTypes.
 * 
 * This will make it possible to have multiple pages,
 * order and sort by column, search for columns, and
 * restrict the page for certain user roles.
 */
router.get(
    '/',
    auth(true),
    pagination([25, 50, 100]),
    ordering('id', 'desc', ['username', 'email', 'role']),
    searching,
    allowedTypes(['ADMIN', 'SHOP_OWNER']),
    async (req, res) => {
        const users = await User.findAll({
            offset: req.offset,
            limit: req.limit,
            order: [[req.sort, req.order]],
            where: searchQueryToWhereClause(req.search, ['id', 'username', 'email', 'role']),
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
            toasters: req.flash('toasters'),
        });
    },
);

/**
 * Used for editing users. The url takes a username instead
 * of an id for the users experience
 */
router.get(
    '/:username/edit',
    auth(true),
    allowedTypes(['ADMIN', 'SHOP_OWNER']),
    async (req, res) => {
        const user = await User.findOne({ where: { username: req.params.username } });

        if (!user) {
            res.redirect('/dashboard/users');
            return;
        }

        res.render('dashboard/users/edit', {
            title: 'Edit user - Dashboard',
            user,
            validated: req.flash('validated'),
            toasters: req.flash('toasters'),
            values: {
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    },
);

/**
 * Used for editing the actual user with a post request. This includes
 * validation and error handling.
 */
router.post(
    '/:username/edit',
    auth(true),
    allowedTypes(['ADMIN', 'SHOP_OWNER']),
    async (req, res) => {
        const { role, username, email, password, confirm_password } = req.body;
        const validated = [];

        // ** START VALIDATION **
        // Validate the form and pass on an id for easy error passing to the DOM
        if (!role) validated.push({ id: 'role', message: 'Please select a role' });
        if (!username) validated.push({ id: 'username', message: 'Please enter a username' });
        if (!email) validated.push({ id: 'email', message: 'Please enter an email' });

        // Only check if a new password is added
        if (password) {
            if (!confirm_password)
                validated.push({ id: 'confirm-password', message: 'Please confirm your password' });
            if (password !== confirm_password)
                validated.push({ id: 'password-match', message: 'Passwords do not match' });
        }
        // ** END VALIDATION **

        if (validated.length > 0) {
            req.flash('validated', validated);
            req.flash('values', req.body);

            // Save before redirecting because we've
            // added something to the flash
            req.session.save(() => {
                res.redirect(`/dashboard/users/${username}/edit`);
            });

            return;
        }

        try {
            await User.update(
                {
                    role,
                    username,
                    email,
                    password,
                },
                {
                    where: {
                        username: req.params.username,
                    },
                },
            );
            req.flash('toasters', [
                {
                    type: 'SUCCES',
                    message: 'User updated successfully',
                },
            ]);
            req.session.save(() => {
                res.redirect('/dashboard/users');
            });
        } catch (err) {
            req.flash('toasters', [
                {
                    type: 'ERROR',
                    message: 'Another user with this username or email already exists',
                },
            ]);
            req.flash('values', req.body);

            // Save before redirecting because we've
            // added something to the flash
            req.session.save(() => {
                res.redirect('/dashboard/users/add');
            });
        }
    },
);

/**
 * Render the user add page
 */
router.get('/add', auth(true), allowedTypes(['ADMIN', 'SHOP_OWNER']), async (req, res) => {
    res.render('dashboard/users/add', {
        title: 'Add User - Dashboard',
        validated: req.flash('validated'),
        toasters: req.flash('toasters'),
        values: req.flash('values'),
    });
});

/**
 * Handles the user add post request with validation and error handling.
 */
router.post('/add', auth(true), async (req, res) => {
    const { type, role, username, email, password, confirm_password, notify } = req.body;
    const validated = [];

    // ** START VALIDATION **
    // Validate the form and pass on an id for easy error passing to the DOM
    if (!type) validated.push({ id: 'type', message: 'Please select an authentication type' });
    if (!role) validated.push({ id: 'role', message: 'Please select a role' });
    if (!username) validated.push({ id: 'username', message: 'Please enter a username' });
    if (!email) validated.push({ id: 'email', message: 'Please enter an email' });

    // Only validate if the password has to be created for the user
    // since the type has been set on 'create'
    if (type === 'create') {
        if (!password) validated.push({ id: 'password', message: 'Please enter a password' });
        if (!confirm_password)
            validated.push({ id: 'confirm-password', message: 'Please confirm your password' });
        if (password !== confirm_password)
            validated.push({ id: 'password-match', message: 'Passwords do not match' });
    }
    // ** END VALIDATION **

    if (validated.length > 0) {
        req.flash('validated', validated);
        req.flash('values', req.body);

        // Save before redirecting because we've
        // added something to the flash
        req.session.save(() => {
            res.redirect('/dashboard/users/add');
        });

        return;
    }

    try {
        await User.create({
            type,
            role,
            username,
            email,
            password,
        });
        req.flash('toasters', [
            {
                type: 'SUCCES',
                message: 'User created successfully',
            },
        ]);
        req.session.save(() => {
            res.redirect('/dashboard/users');
        });
    } catch (err) {
        req.flash('toasters', [
            {
                type: 'ERROR',
                message: 'A user with this username or email already exists',
            },
        ]);
        req.flash('values', req.body);

        // Save before redirecting because we've
        // added something to the flash
        req.session.save(() => {
            res.redirect('/dashboard/users/add');
        });
    }
});

module.exports = router;
