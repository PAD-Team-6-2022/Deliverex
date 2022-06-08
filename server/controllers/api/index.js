const router = require('express').Router();

router.post('/signin', (req, res) => {
    const redirect = req.query.redirect;

    if (redirect) {
        res.redirect(redirect);
    } else {
        res.json({
            message: "Couldn't sign in",
        });
    }
});

router.use('/orders', require('./orders'));
router.use('/users', require('./users'));
router.use('/ORS', require('./ORS'));
router.use('/goals', require('./goals'));
router.use('/votes', require('./votes'));
router.use('/courier', require('./courier'));
router.use('/settings', require('./settings'));

module.exports = router;
