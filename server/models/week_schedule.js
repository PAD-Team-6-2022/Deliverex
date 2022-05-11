const { DataTypes } = require("sequelize");
const sequelize = require("../db/connection");

const WeekSchedule = sequelize.define(
    "weekSchedule",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        monday: {
            type: DataTypes.JSON,
        },
        tuesday: {
            type: DataTypes.JSON,
        },
        wednesday: {
            type: DataTypes.JSON,
        },
        thursday: {
            type: DataTypes.JSON,
        },
        friday: {
            type: DataTypes.JSON,
        },
        saturday: {
            type: DataTypes.JSON,
        },
        sunday: {
            type: DataTypes.JSON,
        }
    },
    {
        underscored: true,
    }
);

module.exports = WeekSchedule;
