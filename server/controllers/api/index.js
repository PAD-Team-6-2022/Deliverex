const router = require('express').Router();

router.use('/orders', require('./orders'));
router.use('/users', require('./users'));
router.use('/ors', require('./ors'));
router.use('/goals', require('./goals'));
router.use('/votes', require('./votes'));
router.use('/courier', require('./courier'));
router.use('/settings', require('./settings'));

module.exports = router;
