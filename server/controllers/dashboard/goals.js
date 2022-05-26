const auth = require('../../middleware/auth');

const router = require('express').Router();

router.get('/', auth(true), async (req, res) => {
    res.render('dashboard/goals/list', {
        title: 'Goals - Dashboard',
    });
});

module.exports = router;
