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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
          isEmail: true,
      },
    },
    state: {
      type: DataTypes.ENUM,
      values: ["SORTING", "READY", "TRANSIT", "DELIVERED", "FAILED"]
    },
    weight: {
      type: DataTypes.DECIMAL(7, 2),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    format: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  },
  {
    underscored: true,
  }
);

module.exports = Order;
