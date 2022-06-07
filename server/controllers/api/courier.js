const router = require("express").Router()
const { WeekSchedule, Location, User } = require("../../models/index")

router.post("/schedule/:id", async (req, res) => {

    const schedule = await WeekSchedule.findByPk(req.params.id);

    if(!schedule) {
        WeekSchedule.create({
            monday: req.body.monday,
            tuesday: req.body.tuesday,
            wednesday: req.body.wednesday,
            thursday: req.body.thursday,
            friday: req.body.friday,
            saturday: req.body.saturday,
            sunday: req.body.sunday,
        })
    } else {
        WeekSchedule.update({
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

});

router.post("/location/:uid/:id", async (req, res) => {

    if(req.params.id === "nan") {
        const loc = await Location.create({
            postal_code: req.body.postalCode,
            city: req.body.city,
            country: req.body.country,
            street: req.body.street,
            house_number: req.body.houseNumber,
            // coordinates: req.body.coordinates,
            created_at: Date.now(),
            updated_at: Date.now(),
        });

        await User.update({
            locationId: loc.dataValues.location_id,
        },
            {
                where: { id: req.params.uid }
            })

    } else {

        await Location.update({
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

});

module.exports = router;
