const { DataTypes } = require("sequelize");
const sequelize = require("../db/connection");

const Order = sequelize.define("order", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  status: {
    type: DataTypes.ENUM,
    values: ["DELIVERED", "ON_THE_WAY", "FAILED"],
    allowNull: false,
  },
  weight: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
  },
});

module.exports = Order;
