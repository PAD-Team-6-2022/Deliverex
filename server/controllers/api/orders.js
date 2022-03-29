const router = require("express").Router();
const Order = require("../../models/order");
const Format = require("../../models/format")

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
    let pickup_stats;
    if(req.body.is_pickup == null) {
        pickup_status = false;
    } else {
        pickup_status = true;
    }
    Order.create({
        status: 'SORTING',
        email: req.body.email,
        weight: req.body.weight,
        created_at: Date.now(),
        country: req.body.country,
        street: req.body.street,
        house_number: req.body.house_number,
        postal_code: req.body.postal_code,
        city: req.body.city,
        format: req.body.sizeFormat,
        is_pickup: pickup_status,
        updated_at: Date.now()})
        .then((orders) => {
            res.redirect('/dashboard')
        })
        .catch((err) => {
            res.status(500).json(err);
        });
});

router.post("/edit", (req, res) => {
    Order.update({
            weight: req.body.weight,
            email: req.body.email,
            country: req.body.country,
            street: req.body.street,
            house_number: req.body.house_number,
            postal_code: req.body.postal_code,
            city: req.body.city,
            format: req.body.sizeFormat,
            status: req.body.status},
        {where: {id: req.body.id}})
        .then(() => {
            res.redirect("/dashboard");
        })
        .catch((err) => {
            res.status(500).json(req.body);
        })
})

router.post("/setting", (req, res) => {
    Format.create({
        length: req.body.length,
        height: req.body.height,
        nameformat: req.body.name,
        width: req.body.width})
        .then((orders) => {
            res.redirect('/dashboard/settings')
        })
        .catch((err) => {
            res.status(500).json(err);
        });
});



module.exports = router;
