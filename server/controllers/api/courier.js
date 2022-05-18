const router = require("express").Router()
const { Timetable } = require("../../models/index")

router.put("/courier/timetable/:id", (req, res) => {

    if(Timetable.count({where: {user_id: req.params.id}}) < 1) {
        Timetable.create({
            mondayStart: req.body.mondayStart,
            mondayEnd: req.body.mondayEnd,
            tuesdayStart: req.body.tuesdayStart,
            tuesdayEnd: req.body.tuesdayEnd,
            wednesdayStart: req.body.wednesdayStart,
            wednesdayEnd: req.body.wednesdayEnd,
            thursdayStart: req.body.thursdayStart,
            thursdayEnd: req.body.thursdayEnd,
            fridayStart: req.body.fridayStart,
            fridayEnd: req.body.fridayEnd,
            saturdayStart: req.body.saturdayStart,
            saturdayEnd: req.body.saturdayEnd,
            sundayStart: req.body.sundayStart,
            sundayEnd: req.body.sundayEnd,
        })
    } else {
        Timetable.update({
            mondayStart: req.body.mondayStart,
            mondayEnd: req.body.mondayEnd,
            tuesdayStart: req.body.tuesdayStart,
            tuesdayEnd: req.body.tuesdayEnd,
            wednesdayStart: req.body.wednesdayStart,
            wednesdayEnd: req.body.wednesdayEnd,
            thursdayStart: req.body.thursdayStart,
            thursdayEnd: req.body.thursdayEnd,
            fridayStart: req.body.fridayStart,
            fridayEnd: req.body.fridayEnd,
            saturdayStart: req.body.saturdayStart,
            saturdayEnd: req.body.saturdayEnd,
            sundayStart: req.body.sundayStart,
            sundayEnd: req.body.sundayEnd,
        },
            {
                where: { user_id: req.params.id },
            })
    }



})
