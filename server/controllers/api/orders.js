const router = require("express").Router();
const { Order, Format } = require("../../models");
const auth = require("../../middleware/auth");
const fetch = require("node-fetch");

router.delete("/:id", (req, res) => {
  Order.destroy({ where: { id: req.params.id } })
    .then(() => {
      res.status(200).json({
        message: "Successfully deleted order",
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: `Something went wrong while trying to delete the order: ${err}`,
      });
    });
});

router.get("/", (req, res) => {
  Order.findAll()
    .then((orders) => {
      res.status(200).json(orders);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

router.post("/", (req, res) => {

    const sendEmail = async (id) => {
        await fetch(`https://api.hbo-ict.cloud/mail`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer pad_rit_6.o8ZLxKESVnaVSVQs',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "from": {
                    "name": "Team 3",
                    "address": "team3@hbo-ict.cloud"
                },
                "to": [
                    {
                        "name": "",
                        "address": req.body.email
                    }
                ],
                "subject": "Track & Trace",
                "html": `Hierbij uw track & trace link: http://${req.rawHeaders[1]}/track/${id}&postal_code=${req.body.postal_code}`
            }),
        });
    }

    let pickup_status = req.body.is_pickup != null;

    Order.create({
        status: 'SORTING',
        email: req.body.email,
        weight: req.body.weight,
        created_at: Date.now(),
        street: req.body.street,
        house_number: req.body.house_number,
        postal_code: req.body.postal_code,
        city: req.body.city,
        country: req.body.country,
        format: req.body.sizeFormat,
        is_pickup: pickup_status,
        updated_at: Date.now()})
        .then((order) => {
            sendEmail(order.dataValues.id);
            res.redirect('/dashboard');
        })
        .catch((err) => {
            res.status(500).json(err);
        });
});

router.post("/edit", (req, res) => {
    let pickup_status = req.body.is_pickup != null;

    Order.update({
            weight: req.body.weight,
            email: req.body.email,
            street: req.body.street,
            house_number: req.body.house_number,
            postal_code: req.body.postal_code,
            city: req.body.city,
            format: req.body.sizeFormat,
            is_pickup: pickup_status,
            updated_at: Date.now(),
            status: req.body.status},
        {where: {id: req.body.id}})
        .then(() => {
            res.redirect("/dashboard");
        })
        .catch((err) => {
            res.status(500).json(req.body);
        })
})

router.post("/setting", auth(true), (req, res) => {
    Format.create({
        length: req.body.length,
        height: req.body.height,
        nameformat: req.body.name,
        width: req.body.width,
        userId: req.user.id})
        .then((orders) => {
            res.redirect('/dashboard/settings')
        })
        .catch((err) => {
            res.status(500).json(err);
        });
});



module.exports = router;
