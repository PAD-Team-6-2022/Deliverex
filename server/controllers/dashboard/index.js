const router = require("express").Router();
const Order = require("../../models/order");
const Format = require("../../models/format");
const passport = require("../../auth/passport");
const auth = require("../../middleware/auth");
const pagination = require("../../middleware/pagination");
const ordering = require("../../middleware/ordering");
const convert = require("convert-units");
const searching = require("../../middleware/searching");
const {searchQueryToWhereClause} = require("../../util");
const moment = require("moment");
const {User, Company, Location} = require("../../models");

router.get("/", auth(true), (req, res) => {
    res.redirect("/dashboard/overview");
});

router.get(
    "/overview",
    auth(true),
    pagination([25, 50, 100]),
    ordering("id", "desc"),
    searching,
    async (req, res) => {
        // Get the orders with the calculated offset, limit for pagination and details about the sorting order
        const orders =
            req.user.role === "COURIER"
                ? await Order.findAll({
                    where: {courier_id: req.user.getDataValue("id"), delivery_date: moment().format("YYYY-MM-DD")},
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
        res.render(req.user.role === "COURIER" ?
            "dashboard/courier/overview" :
            "dashboard/overview", {
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
    const user = await User.findByPk(req.user.id);
    const company = await Company.findByPk(req.user.companyId)
    const location = await Location.findByPk(company.location_id)

    res.render("dashboard/settings", {
        title: "Package sizes",
        formats,
        user,
        company,
        location,
    });
});

router.use("/orders", require("./orders"));
router.use("/scan", require("./scanner"));
router.use("/users", require("./users"));

module.exports = router;
