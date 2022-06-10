const router = require('express').Router();
const {Format, User, Company, Location} = require("../../models");
const auth = require("../../middleware/auth");

router.put('/editFormat/:id', (req, res) => {
    Format.update(
        {
            height: req.body.height,
            length: req.body.length,
            width: req.body.width,
            nameformat: req.body.nameformat,
        },
        { where: { id: req.params.id } },
    )
        .then((affectedRows) => {
            res.status(200).json({
                message: `${affectedRows} rows updated`,
            });
        })
        .catch((err) => {
            res.status(500).json(err);
        });
});
/**
 * Laad in de settings pagina met alle gegevens van de ingelogde account
 */
router.post('/setting', auth(true), (req, res) => {
    Format.create({
        length: req.body.length,
        height: req.body.height,
        nameformat: req.body.name,
        width: req.body.width,
        userId: req.user.id,
    })
        .then((format) => {
            res.status(200).json({
                format,
                message: `format ${format.id} created`,
            });
        })
        .catch((err) => {
            res.status(500).json(err);
        });
});

/**
 * Account gegevens worden geupdate
 */
router.put('/editAccount', (req, res) => {
    console.log(req);
    User.update(
        {
            username: req.body.username,
            email: req.body.email,
        },
        { where: { id: req.user.id } },
    )
        .then((affectedRows) => {
            res.status(200).json({
                message: `${affectedRows} rows updated`,
            });
        })
        .catch((err) => {
            res.status(500).json(err);
        });
});

/**
 * Precentage naar doel wordt hier aangepast
 */
router.put('/editDoelPercentage', (req, res) => {
    Company.update(
        {
            percentageToGoal: req.body.percentage,
        },
        { where: { id: req.user.company_id } },
    )
        .then((affectedRows) => {
            res.status(200).json({
                message: `${affectedRows} rows updated`,
            });
        })
        .catch((err) => {
            res.status(500).json(err);
        });
});

/**
 * Winkel gegevens worden hier aangepast
 */
router.put('/editStore', async (req, res) => {
    Company.update(
        {
            name: req.body.name,
            email: req.body.email,
        },
        { where: { id: req.user.company_id } },
    )
        .then((affectedRows) => {
            res.status(200).json({
                message: `${affectedRows} rows updated`,
            });
        })
        .catch((err) => {
            res.status(500).json(err);
        });

    const company = await Company.findAll({
        where: {
            id: 1,
        },
    });

    Location.update(
        {
            streethouse_number: req.body.streethouseNumber,
            postal_code: req.body.postalCode,
            city: req.body.city,
            country: req.body.country,
        },
        { where: { location_id: company[0].id } },
    );
});

module.exports = router;