const { Op } = require("sequelize");

const searchQueryToWhereClause = (query, fields) => {
  return {
    [Op.or]: fields.map((field) => ({
      [field]: {
        [Op.like]: `%${query}%`,
      },
    })),
  };
};

/**
 * Takes a list of orders and uses it to produce
 * a list of orders in shipment-format. To be fed to
 * the ORS route optimization endpoint.
 *
 * @param orders array of orders
 * @returns shipments array of shipments
 */
const convertOrdersToShipments = (orders) => {

  const shipments = [];
  orders.forEach((order) => {

    //TODO:
    // -change the way pickup coordinates should be retrieved (retrieve it from the company)
    // -check & account for the time period the order is planned for (morning, afternoon, evening)
    // -calculate the 'amount' either based on the order's weight and format, or the actual amount of packages

    const id = order.getDataValue("id");

    const pickUpCoordinates = order.getDataValue('pickup_coordinates').coordinates;
    const deliveryCoordinates = order.getDataValue("coordinates").coordinates;

    shipments.push({
      amount: [1],
      skills: [1],
      pickup: {
        id,
        service: 60,
        location: pickUpCoordinates
      },
      delivery: {
        id,
        service: 90,
        location: deliveryCoordinates
      }
    });
  });
  return shipments;
}

/**
 * Takes a list of users and uses it to produce
 * a list of users in vehicle-format. To be fed to
 * the ORS route optimization endpoint.
 *
 * @param users array of orders
 * @returns shipments array of shipments
 */
const convertUsersToVehicles = (users) => {
  const vehicles = [];

  users.forEach((user) => {

    //TODO:
    // -retrieve & utilize working hours of this user
    // -retrieve & utilize the users starting coordinates
    // -retrieve & utilize the vehicle profile of the user from database
    // -calculate the users capacity (based on his vehicle profile or some other factor(s))

    //Coordinates representing Buikslotermeerplein shopping center. Hardcoded placeholder value.
    const USER_START_COORDINATES = [4.9377803248666865, 52.39922180769369];

    const id = user.getDataValue("id");
    const working_hours = [28800, 72000]

    vehicles.push({
      id,
      profile: "cycling-regular",
      start: USER_START_COORDINATES,
      capacity: [4],
      skills: [1],
      time_window: working_hours
    });
  });
  return vehicles;
}

module.exports = { searchQueryToWhereClause, convertOrdersToShipments, convertUsersToVehicles};
