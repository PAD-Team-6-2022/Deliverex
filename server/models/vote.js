const { DataTypes } = require("sequelize");
const sequelize = require("../db/connection");

const Vote = sequelize.define(
    "vote",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
    },
    {
        underscored: true,
    }
);

module.exports = Vote;
