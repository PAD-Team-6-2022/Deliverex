const { DataTypes } = require("sequelize");
const sequelize = require("../db/connection");

const Organisation = sequelize.define(
    "organisation",
    {
        name: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
        },
        operatingScheduleId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        plannedMode: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    },
    {
        underscored: true,
    }
);

module.exports = Organisation;
