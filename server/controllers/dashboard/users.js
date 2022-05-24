const router = require('express').Router();

router.get('/', (req, res) => {
    res.render('dashboard/users/list', { title: 'Users - Dashboard' });
});

module.exports = router;
