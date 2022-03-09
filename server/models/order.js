const { DataTypes } = require("sequelize");
const sequelize = require("../db/connection");

const Order = sequelize.define(
  "order",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    state: {
      type: DataTypes.ENUM,
      values: ["SORTING", "READY", "TRANSIT", "DELIVERED", "FAILED"],
      allowNull: false,
    },
    weight: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
  },
  {
    underscored: true,
  }
);

module.exports = Order;
