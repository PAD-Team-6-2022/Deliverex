const router = require("express").Router();
const Order = require("../../models/order");
const Format = require("../../models/format");
const passport = require("../../auth/passport");
const auth = require("../../middleware/auth");
const pagination = require("../../middleware/pagination");
const ordering = require("../../middleware/ordering");
const convert = require("convert-units");
const searching = require("../../middleware/searching");
const { searchQueryToWhereClause,
    convertOrdersToShipments} = require("../../util");
const moment = require("moment");
const fetch = require("node-fetch");

router.get("/", auth(true), (req, res) => {
    if(req.user.role === 'SHOP_OWNER')
        res.redirect("/dashboard/shop_owner/overview");
    else if(req.user.role === 'COURIER')
        res.redirect("/dashboard/courier/overview");
    else if(req.user.role === 'ADMIN')
        res.redirect("/dashboard/admin/overview");
});

router.get("/courier/overview", auth(true), (req, res) => {

    Order.findAll({where: {courier_id: req.user.id}})
        .then((orders) => {

            //TODO: The data directly below is largely hardcoded and has to be
            // replaced by various factors from the database. See
            // 'utils.js' for further explanation.
            const shipments = convertOrdersToShipments(orders);
            const USER_START_COORDINATES = [4.937771, 52.399239];

            const working_hours = [30600, 72000];
            const vehicle = {
                id: req.user.id,
                profile: "cycling-regular",
                start: USER_START_COORDINATES,
                capacity: [4],
                skills: [1],
                time_window: working_hours
            };

            fetch('https://api.openrouteservice.org/optimization', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
                    'Authorization': process.env.ORS_API_KEY,
                    'Content-Type': 'application/json; charset=utf-8'
                },
                body: '{"shipments": ' + JSON.stringify(shipments) + ',' +
                    '"vehicles": ' + JSON.stringify([vehicle]) + '}'
            }).then(response => response.json())
                .then((data) => {
                    orders.forEach((order) => {
                        //converteer het gewicht van elke order naar de beste maat
                        let value = convert(order.weight).from("g").toBest();
                        order.weight = `${Math.round(value.val)} ${value.unit}`;

                        // Format the created_at date
                        order.date = moment(order.created_at).format("YYYY-MM-DD");
                    });

                    const checkpoints = [];
                    if(data.routes)
                    data.routes[0].steps.forEach((step) => {
                        orders.forEach((order) => {
                            if(order.getDataValue('id') === step.id){
                                if(step.type !== 'start'){
                                    const isPickup = step.type === 'pickup';
                                    checkpoints.push({
                                        location: {
                                            address:
                                                `${order.getDataValue( isPickup ? 'pickup_street' : 'street')} ${order
                                                    .getDataValue(isPickup ? 'pickup_house_number': 'house_number')}`,
                                            city: order.getDataValue(isPickup ? 'pickup_city': 'city'),
                                            postal_code: order.getDataValue(isPickup ? 'pickup_postal_code': 'postal_code'),
                                            country: order.getDataValue(isPickup ? 'pickup_country' : 'country')
                                        },
                                        type: step.type,
                                        order_id: step.id,
                                        time: moment((step.arrival - 3600) * 1000).format("hh:mm:ss"),
                                        hasCompleted: isPickup ?
                                            ((order.getDataValue('status') === 'TRANSIT' ||
                                                (order.getDataValue('status') === 'DELIVERED'))) :
                                            (order.getDataValue('status') === 'DELIVERED')
                                    });
                                    }
                                }
                            });
                     });
                    res.render("dashboard/courier/overview", {
                        title: "Overzicht - Dashboard",
                        checkpoints,
                        orders,
                        user: req.user,
                        total_duration: data.duration
                    });
                }).catch((err) => {
                    console.log(err);
                res.status(500).json(err);
            })
        }).catch((err) => {
        console.error(`Failed to retrieve orders from database. Errormessage: ${err}`)
    })
});

router.get(
  "/shop_owner/overview",
  auth(true),
  pagination([25, 50, 100]),
  ordering("id", "desc"),
  searching,
  async (req, res) => {
    // Get the orders with the calculated offset, limit for pagination and details about the sorting order
    const orders =
      req.user.role === "COURIER"
        ? await Order.findAll({
            where: { courier_id: req.user.getDataValue("id") },
          })
        : await Order.findAll({
            offset: req.offset,
            limit: req.limit,
            order: [[req.sort, req.order]],
            where: searchQueryToWhereClause(req.search, [
              "id",
              "weight",
              "status",
            ]),
          });

    //Count specific values from database
    const ordersAmount = await Order.count();
    const deliverdAmount = await Order.count({
      where: {
        status: "DELIVERED",
      },
    });

    orders.forEach((order) => {
      //converteer het gewicht van elke order naar de beste maat
      let value = convert(order.weight).from("g").toBest();

      order.weight = `${Math.round(value.val)} ${value.unit}`;

      // Format the created_at date
      order.date = moment(order.created_at).format("YYYY-MM-DD");
    });

    // Render the page, pass on the order array
    res.render("dashboard/overview", {
      title: "Overzicht - Dashboard",
      orders,
      sort: req.sort,
      order: req.order,
      limit: req.limit,
      user: req.user,
      search: req.search,
      page: req.page,
      ordersAmount,
      deliverdAmount,
    });
  }
);

router.get("/signin", auth(false), (req, res) => {
  res.render("dashboard/signin", {
    title: "Sign In - Dashboard",
  });
});

// Authentication via Passport.js
router.post(
  "/signin",
  auth(false),
  passport.authenticate("local", {
    failureRedirect: "/dashboard/signin",
  }),
  (req, res) => {
    // Saving the session before redirecting,
    // otherwise req#isAuthenticated() returns
    // null. Not sure why that is, but it has
    // been an issue since 2015.
    req.session.save(() => {
      res.redirect("/dashboard");
    });
  }
);

router.get("/signout", auth(true), (req, res) => {
  req.logout();
  res.redirect("/");
});

/**
 * Render the package size page
 */
router.get("/settings", async (req, res) => {
  const formats = await Format.findAll();

  res.render("dashboard/settings", {
    title: "Package sizes",
    formats,
  });
});

router.use("/orders", require("./orders"));
router.use("/scan", require("./scanner"));
router.use("/users", require("./users"));

module.exports = router;
