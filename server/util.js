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
 * a list of orders in shipment-format
 *
 * @param orders array of orders
 * @returns shipments array of shipments
 */
const convertOrdersToShipments = (orders) => {

  const shipments = [];
  orders.forEach((order) => {
    const id = order.getDataValue("id");

    //const coordinates = order.getDataValue("coordinates").coordinates;

    const pickUpCoordinates = order.getDataValue('pickup_coordinates').coordinates; //[4.899824084791778, 52.37902398071498]; //<-- placeholder. Dit moet worden gedefinieerd per order!
    const deliveryCoordinates = order.getDataValue("coordinates").coordinates;

    //Check what time period the order is planned for. Use this to map it to a
    //time-frame which can be used in the order calculation. There needs to be a
    //timeframe for morning, afternoon and evening
    /*
    const timePeriod = order.getDataValue('time_period').hasTimePeriod ?
        order.getDataValue('time_period') :
    */

    //amount moet ook kunnen veranderen! Dit is dus als je meerdere pakketten hebt in 1 order

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
 * a list of users in vehicle-format
 *
 * @param users array of orders
 * @returns shipments array of shipments
 */
const convertUsersToVehicles = (users) => {
  const vehicles = [];

  const USER_START_COORDINATES = [4.9377803248666865, 52.39922180769369]; //deze moeten worden op een of andere manier worden opgehaald

  users.forEach((user) => {
    const id = user.getDataValue("id");
    const working_hours = [28800, 72000] //user.getDataValue("working_hours"), moet nog aangepast worden

    //Vergeet niet dat 'driving car' ook als profile zou kunnen worden toegevoegd

    //'capacity' moet zich vertalen naar 'max-aantal-bezorgingen'. Dit moet voor beide fietskoriers & bestelbusjes
    //kunnen worden ingesteld
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
