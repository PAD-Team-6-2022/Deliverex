const { Op } = require("sequelize");
const EventEmitter = require('events');
const moment = require("moment");

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

    const pickUpCoordinates = order.getDataValue('userCreated').company.location.coordinates.coordinates;
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
        service: 60,
        location: deliveryCoordinates
      }
    });
  });
  return shipments;
}

const convertOrdersToJobs = (orders) => {
  const jobs = [];

  orders.forEach((order) => {
    //TODO:
    // -change the way pickup coordinates should be retrieved (retrieve it from the company)
    // -check & account for the time period the order is planned for (morning, afternoon, evening)
    // -calculate the 'amount' either based on the order's weight and format, or the actual amount of packages

    const id = order.getDataValue("id");

    const deliveryCoordinates = order.getDataValue("coordinates").coordinates;

    jobs.push({
      id,
      amount: [1],
      skills: [1],
      service: 60,
      location: deliveryCoordinates,
      delivery: [1]
    });
  });
  return jobs;
}

/**
 * Returns the timestamp of a specific moment in seconds
 *
 * @param timestamp
 * @returns {number}
 */
const getTimestampInSeconds = (timestamp) => {
  return moment(timestamp, "HH:mm:ss").diff(moment().startOf('day'), 's');
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

    const rawWorkingHours = user.getDataValue('todaySchedule');

    //Convert the working hour timestamps from 'HH:mm:ss' format to seconds since
    //the day started. This is the format required by ORS.
    const startingTime = getTimestampInSeconds(rawWorkingHours.start);
    const endingTime = getTimestampInSeconds(rawWorkingHours.end);

    vehicles.push({
      id,
      profile: "cycling-regular",
      start: USER_START_COORDINATES,
      capacity: [4],
      skills: [1],
      time_window: [startingTime, endingTime]
    });
  });
  return vehicles;
}

const orderRequestEvents = new EventEmitter();

const addOrderToDeliveryQueue = (id) => {
  orderRequestEvents.emit('sameDayDelivery', id);
}
const onSameDayDelivery = (handlerCallBack) => {
  orderRequestEvents.on('sameDayDelivery', handlerCallBack);
}
const notifyOrderStatusChange = (id, status) => {
  orderRequestEvents.emit('orderStatusChange', id, status);
}
const onOrderStatusChange = (handlerCallBack) => {
  orderRequestEvents.on('orderStatusChange', handlerCallBack);
}

module.exports = {
  searchQueryToWhereClause,
  convertOrdersToShipments,
  convertUsersToVehicles,
  convertOrdersToJobs,
  addOrderToDeliveryQueue,
  onSameDayDelivery,
  notifyOrderStatusChange,
  onOrderStatusChange,
  getTimestampInSeconds
};
