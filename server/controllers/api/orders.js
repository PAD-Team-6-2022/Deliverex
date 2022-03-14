const router = require("express").Router();
const Order = require("../../models/order");

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
    Order.create({state: 'SORTING', weight: req.body.weight, created_at: Date.now(),
        country: req.body.country, address: `${req.body.street} ${Number(req.body.houseNumber)}`, format: 'its a big boi'})
        .then((orders) => {
            res.redirect('/dashboard')
        })
        .catch((err) => {
            res.status(500).json(err);
        });
});

module.exports = router;
