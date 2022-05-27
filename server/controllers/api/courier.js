const router = require("express").Router()
const { Timetable } = require("../../models/index")

router.put("/courier/timetable/:id", (req, res) => {

    if(!req.params.id || WeekSchedule.findByPk(req.params.id) < 1) {
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



})

module.exports = router;
