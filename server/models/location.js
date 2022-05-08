const { DataTypes } = require("sequelize");
const sequelize = require("../db/connection");


const Location = sequelize.define(
    "location",
    {
        location_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
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
        }
    },
    {
        underscored: true,
    }
);

module.exports = Location;
