const router = require("express").Router();
const Order = require("../models/order");
const convert = require("convert-units");

/**
 * Render the homepage
 */
router.get("/", (req, res) => {
  res.render("home", { title: "Homepage", toasters: req.flash('toasters') })
});



/**
 * Render tracker page for order with given id
 */
router.get("/track/:postal_code/:id", async (req, res) => {
  const { id, postal_code } = req.params;
  // find the one order with the given id and postal_code combination
  const order = await Order.findOne({
    where: {
      id: id,
      postal_code: postal_code
    }
  });;

  // redirect with toaster and the given order
  if (!order) {
    const toasters = [
      {
        type: "ERROR",
        message: "Oops! We couldn't find your package"
      },
    ];

    req.flash('toasters', toasters);

    req.session.save(() => {
      res.redirect("/");
    });
    
    return;
  }

  const convertedWeight = convert(order.weight).from("g").toBest();
  order.weight = `${Math.round(convertedWeight.val)} ${convertedWeight.unit}`;
  
  res.render("tracker", { title: "Track & Trace", order });
});

module.exports = router;
