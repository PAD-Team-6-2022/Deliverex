const { DataTypes, ENUM} = require("sequelize");
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
    phone_number: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    status: {
      type: DataTypes.ENUM,
      values: ["SORTING", "READY", "TRANSIT", "DELIVERED", "FAILED"],
    },
    weight: {
      type: DataTypes.DECIMAL(7, 2),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    delivery_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    time_period: {
        type: ENUM('MORNING', 'AFTERNOON', 'EVENING'),
        allowNull: true,
        validate: {
            hasTimePeriod: true
        }
    },
    street: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    house_number: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    postal_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    coordinates: {
        type: DataTypes.GEOMETRY('POINT')
    },
    is_pickup: {
      type: DataTypes.STRING,
      allowNull: false,
    },
      pickup_street: {
          type: DataTypes.STRING,
          allowNull: true,
      },
      pickup_house_number: {
          type: DataTypes.STRING,
          allowNull: true,
      },
      pickup_postal_code: {
          type: DataTypes.STRING,
          allowNull: true,
      },
      pickup_city: {
          type: DataTypes.STRING,
          allowNull: true,
      },
      pickup_country: {
          type: DataTypes.STRING,
          allowNull: true,
      },
      pickup_coordinates: {
          type: DataTypes.GEOMETRY('POINT')
      },
    courier_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
  },
  {
    underscored: true,
    initialAutoIncrement: 100000,
  }
);

module.exports = Order;
