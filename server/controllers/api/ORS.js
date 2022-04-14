const router = require("express").Router();
const fetch = require('node-fetch');
const Order = require("../../models/order");
const User = require("../../models/user");
const auth = require("../../middleware/auth");
const API_KEY = process.env.ORS_API_KEY;
const {convertOrdersToShipments, convertUsersToVehicles} = require("../../util");

const cron = require("node-cron");

const SORTING_TIME = "30 8"; //represents 8:30. This value must later be changed to one
//of type 'Date'

//cron.schedule(`* ${SORTING_TIME} * * *`, () => {

//Is called every 5 seconds of every minute, of every hour, etc.
/*cron.schedule("0,5,10,15,20,25,30,35,40,45,50,55 * * * * *", () => {
    console.log('test');
}, {
    scheduled: true
})*/

//The times of when the workday starts and ends.
const BEGIN_TIME = 0; //placeholder value. Load this from database.
const END_TIME = 342424; //placeholder value. Load this from database.

//Get current date
const today = new Date();

//Convert it to the same format as the database returns its dates in
const todayMonth = (today.getMonth() + 1) < 10 ?
    `0${(today.getMonth() + 1)}` :
    (today.getMonth() + 1);
const todayDate = today.getDate() < 10 ?
    `0${today.getDate()}` : today.getDate();
const todayConverted = `${today.getFullYear()}-${todayMonth}-${todayDate}`;

Order.findAll({where: {status: 'READY', courier_id: null, delivery_date: todayConverted}})
    .then((orders) => {
        console.log('testing: ' + orders.length);

        if (!orders.length)
            return;

        const shipments = convertOrdersToShipments(orders);

        //check in de 'where' simpelweg of de koerier ergens tussen 'BEGIN_TIME' en 'END_TIME' van VANDAAG werkt
        User.findAll({where: {role: 'COURIER'}})
            .then((users) => {
                const vehicles = convertUsersToVehicles(users);

                fetch('https://api.openrouteservice.org/optimization', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
                        'Authorization': API_KEY,
                        'Content-Type': 'application/json; charset=utf-8'
                    },
                    body: '{"shipments": ' + JSON.stringify(shipments) + ',' + '"vehicles": ' + JSON.stringify(vehicles) + '}'
                }).then(response => response.json())
                    .then((data) => {
                        //Loop through every order of every route to assign the right orders to the right couriers
                        data.routes.forEach((route) => {
                            for (let i = 0; i < route.steps.length; i++) {
                                //To prevent updating the same order twice, we ignore steps of type 'start' and 'delivery'
                                if (route.steps[i].type === 'pickup')
                                    Order.update({status: 'TRANSIT', courier_id: route.vehicle},
                                        {where: {id: route.steps[i].id}}).then((rowsAffected) => {
                                        console.log(`Updated order ${route.steps[i].id}. ${rowsAffected} rows affected.`)
                                    }).catch((err) => {
                                        console.log(`Could not update order ${route.steps[i].id}. Error message: ${err}`)
                                    });
                            }
                        })
                    }).catch((err) => {
                    console.error(err);
                });
            }).catch((err) => {
            console.error(`Failed to retrieve couriers from database. Errormessage: ${err}`)
        })
    }).catch((err) => {
    console.error(`Failed to retrieve orders from database. Errormessage: ${err}`)
});


router.get("/", auth(true), (req, res) => {
    Order.findAll({where: {courier_id: req.user.id}})
        .then((orders) => {

            const shipments = convertOrdersToShipments(orders);

            const MAIN_CENTER_COORDINATES = [4.899824084791778, 52.37902398071498]; //deze moeten worden opgehaald uit de database.
            const working_hours = [28800, 72000] //user.getDataValue("working_hours"), moet nog aangepast worden

            //Note:  capacity, main center coordinates & working_hours nog aan te passen
            const vehicle = {
                id: req.user.id,
                profile: "cycling-regular",
                start: MAIN_CENTER_COORDINATES,
                capacity: [2],
                skills: [1],
                time_window: working_hours
            };

            fetch('https://api.openrouteservice.org/optimization', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
                    'Authorization': API_KEY,
                    'Content-Type': 'application/json; charset=utf-8'
                },
                body: '{"shipments": ' + JSON.stringify(shipments) + ',' +
                    '"vehicles": ' + JSON.stringify([vehicle]) + '}'
            }).then(response => response.json())
                .then((data) => {
                   //console.log(data.routes[0].steps);

                    const addresses = [];
                    data.routes[0].steps.forEach((step) => {
                        for (let i = 0; i < orders.length; i++) {
                            if(orders[i].getDataValue(step.id)){
                               // if(step.type === 'pickup')

                            }
                        }
                    })

                    res.status(200).json(data);

                }).catch((err) => {
                    res.status(500).json(err);
            })
        }).catch((err) => {
        console.error(`Failed to retrieve orders from database. Errormessage: ${err}`)
    })
})

module.exports = router;