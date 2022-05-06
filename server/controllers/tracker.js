const router = require("express").Router();
const { Order, Format, Vote, Goal } = require("../models/");
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
        id,
        postal_code
      },
      include: [Format, Vote]
    },
  );

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

  // Get the current goal(the goal that's being collected for)
  const currentGoal = await Goal.findOne({
    where: {
      status: "CURRENT"
    }
  });

  // Get the acive goals(the goal that's being voted on)
  const activeGoals = await Goal.findAll({
    limit: 2,
    where: {
      status: "ACTIVE"
    }
  });

  // the goal that is voted on
  const votedGoal = await Vote.findOne({
    where: {
      orderId: id,
    },
    include: [Goal],
  })

  const convertedWeight = convert(order.weight).from("g").toBest();
  order.weight = `${Math.round(convertedWeight.val)} ${convertedWeight.unit}`;
  
  res.render("tracker", { title: "Track & Trace", order, currentGoal, activeGoals, votedGoal });
});

module.exports = router;
