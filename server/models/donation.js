const { DataTypes } = require("sequelize");
const sequelize = require("../db/connection");

const Donation = sequelize.define(
    "donation",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        amount: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: false,
        },
    },
    {
        underscored: true,
    }
);

module.exports = Donation;
