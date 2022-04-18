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
        streethouse_number: {
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
    },
    {
        underscored: true,
    }
);

module.exports = Location;
