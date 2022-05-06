const router = require("express").Router();
const { Order, Format, User, Location, Company } = require("../../models");
const auth = require("../../middleware/auth");
const fetch = require("node-fetch");
const ejs = require("ejs");
const path = require('path')
const {addOrderToDeliveryQueue}  = require("../../util");

router.delete("/:id", (req, res) => {
    Order.destroy({where: {id: req.params.id}})
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

router.delete("/settings/:id", (req, res) => {
    Format.destroy({where: {id: req.params.id}})
        .then(() => {
            res.status(200).json({
                message: "Successfully deleted format",
            });
        })
        .catch((err) => {
            res.status(500).json({
                message: `Something went wrong while trying to delete the format: ${err}`,
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
        let emailTemplate = await ejs.renderFile(path.resolve(__dirname, "../../views/mail/template.ejs"), {
            link: `http://${req.rawHeaders[1]}/track/${req.body.postal_code}/${id}`,
        });

        await fetch(`https://api.hbo-ict.cloud/mail`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer pad_rit_6.o8ZLxKESVnaVSVQs',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "from": {
                    "name": "Team 6",
                    "address": "team6@hbo-ict.cloud"
                },
                "to": [
                    {
                        "name": "",
                        "address": req.body.email
                    }
                ],
                "subject": "Track & Trace",
                "html": emailTemplate,
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
    format_id: req.body.format_id,
    is_pickup: pickup_status,
    updated_at: Date.now(),
    price: req.body.price,
    // coordinates: req.body.coordinates
  })
    .then((order) => {
      //if(req.body.delivery_date === today)
          addOrderToDeliveryQueue(order.getDataValue('id'));

      sendEmail(order.id);
      res.status(200).json({
        order,
        message: `order ${order.id} created`
      });
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
        formatId: req.body.format_id,
        status: req.body.status,
        is_pickup: pickup_status,
        updated_at: Date.now(),
        price: req.body.price,
        // coordinates: req.body.coordinates
    },
    { where: { id: req.body.id } })
    .then((affectedRows) => {
      res.status(200).json({
        message: `${affectedRows} rows updated`
      });
    })
    .catch((err) => {
      res.status(500).json(err);
    })
})

router.put("/editFormat/:id", (req, res) => {
    Format.update({
            height: req.body.height,
            length: req.body.length,
            width: req.body.width,
            nameformat: req.body.nameformat,
        },
        {where: {id: req.params.id}})
        .then((affectedRows) => {
            res.status(200).json({
                message: `${affectedRows} rows updated`
            });
        })
        .catch((err) => {
            res.status(500).json(err);
        })
})


router.post("/setting", auth(true), (req, res) => {
    Format.create({
        length: req.body.length,
        height: req.body.height,
        nameformat: req.body.name,
        width: req.body.width,
        userId: req.user.id
    })
        .then((format) => {
            res.status(200).json({
                format,
                message: `format ${format.id} created`
            });
        })
        .catch((err) => {
            res.status(500).json(err);
        });
});


router.put("/editAccount/:id", (req, res) => {
    console.log(req)
    User.update({
            username: req.body.username,
            email: req.body.email,
        },
        {where: {id: req.params.id}})
        .then((affectedRows) => {
            res.status(200).json({
                message: `${affectedRows} rows updated`
            });
        })
        .catch((err) => {
            res.status(500).json(err);
        })
})

router.put("/editDoelPercentage/:id", (req, res) => {
    Company.update({
            percentageToGoal: req.body.percentage,
        },
        {where: {id: req.params.id}})
        .then((affectedRows) => {
            res.status(200).json({
                message: `${affectedRows} rows updated`
            });
        })
        .catch((err) => {
            res.status(500).json(err);
        })
})

router.put("/editStore/:id", (req, res) => {
    Company.update({
            name: req.body.name,
            email: req.body.email,
        },
        {where: {id: req.params.id}})
        .then((affectedRows) => {
            res.status(200).json({
                message: `${affectedRows} rows updated`
            });
        })
        .catch((err) => {
            res.status(500).json(err);
        })

    Location.update({
            streethouse_number: req.body.streethouseNumber,
            postal_code: req.body.postalCode,
            city: req.body.city,
            country: req.body.country,
        },
        {where: {location_id: req.params.id}})

})


/**
 * Retrieves the order associated with a given ID. Since it is assumed that
 * request will come from the scanning page, the server will check whether
 * this order is being scanned by the right courier for safety sake.
 */
router.get("/:id/scan", auth(true), async (req, res) => {
    const {id} = req.params;

    await Order.findByPk(id).then((order) => {
        res.json({
            order: order, isNotAuthorized:
                (order.getDataValue('courier_id') !== req.user.id)
        });
    }).catch((error) => {
        res.status(404).json(`Could not find order with ID ${id}. Error: ${error}`);
    });
});

/**
 * Updates the 'courier_id' attribute of an order to the given ID of the courier.
 * In case the order could not be found or another error was caught, the server
 * will respond with the appropriate error messages.
 */
router.put("/:id/scan", auth(true), (req, res) => {

    Order.findByPk(req.body.id).then((order) => {

        let newStatus;
        if (order.status === 'SORTING')
            newStatus = 'READY';
        else if (order.status === 'READY')
            newStatus = 'TRANSIT';
        else if (order.status === 'TRANSIT')
            newStatus = 'DELIVERED';

        Order.update({status: newStatus}, {where: {id: req.body.id}}).then((data) => {
            res.sendStatus(200);
        }).catch((error) => {
            console.error(`Could not assign order to courier. Error message: ${error}`)
            res.sendStatus(500);
        });
    }).catch((error) => {
        res.status(404).json(`Could not find order with ID ${req.body.id}. Error: ${error}`);
    })
});

/**
 * Updates the status of an order from 'TRANSIT' to 'DELIVERED' and
 * reloads the page.
 */
router.post("/:id/scan", async (req, res) => {
    Order.update({status: 'DELIVERED'}, {where: {id: req.body.selectedOrder}}).then(() => {
        res.redirect('/dashboard/overview');
    }).catch((error) => {
        res.status(500).json(`Caught error while updating delivery status: ${error}`);
    });
});

module.exports = router;
