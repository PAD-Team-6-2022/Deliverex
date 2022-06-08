const router = require("express").Router()
const { WeekSchedule, Location, User } = require("../../models/index")

router.post("/schedule/:id", async (req, res) => {

    const schedule = await WeekSchedule.findByPk(req.params.id);

    if(!schedule) {
        await WeekSchedule.create({
            monday: req.body.monday,
            tuesday: req.body.tuesday,
            wednesday: req.body.wednesday,
            thursday: req.body.thursday,
            friday: req.body.friday,
            saturday: req.body.saturday,
            sunday: req.body.sunday,
        })
    } else {
        await WeekSchedule.update({
            monday: req.body.monday,
            tuesday: req.body.tuesday,
            wednesday: req.body.wednesday,
            thursday: req.body.thursday,
            friday: req.body.friday,
            saturday: req.body.saturday,
            sunday: req.body.sunday,
        },
            {
                where: { id: req.params.id },
            })
    }

    res.sendStatus(200);

});

router.post("/location/:uid/:id", async (req, res) => {

    if(req.params.id === "nan") {

        let loc;
        if(req.body.coordinates.length > 2) {
            loc = await Location.create({
                postal_code: req.body.postalCode,
                city: req.body.city,
                country: req.body.country,
                street: req.body.street,
                house_number: req.body.houseNumber,
                coordinates: { type: 'Point', coordinates: Object.values(JSON.parse(req.body.coordinates)).reverse()},
                created_at: Date.now(),
                updated_at: Date.now(),
            });
        } else {
            loc = await Location.create({
                postal_code: req.body.postalCode,
                city: req.body.city,
                country: req.body.country,
                street: req.body.street,
                house_number: req.body.houseNumber,
                created_at: Date.now(),
                updated_at: Date.now(),
            });
        }

        await User.update({
            locationId: loc.dataValues.location_id,
        },
            {
                where: { id: req.params.uid }
            })

        res.status(200).json(loc);

    } else {

        let loc;

        if(req.body.coordinates > 2) {
            loc = await Location.update({
                    postal_code: req.body.postalCode,
                    city: req.body.city,
                    country: req.body.country,
                    street: req.body.street,
                    house_number: req.body.houseNumber,
                    coordinates: { type: 'Point', coordinates: Object.values(JSON.parse(req.body.coordinates)).reverse()},
                    updated_at: Date.now(),
                },
                {
                    where: { location_id: req.params.id }
                })
        } else {
            loc = await Location.update({
                    postal_code: req.body.postalCode,
                    city: req.body.city,
                    country: req.body.country,
                    street: req.body.street,
                    house_number: req.body.houseNumber,
                    // coordinates: req.body.coordinates,
                    updated_at: Date.now(),
                },
                {
                    where: { location_id: req.params.id }
                })
        }

        res.status(200).json(loc);
    }

});

module.exports = router;
