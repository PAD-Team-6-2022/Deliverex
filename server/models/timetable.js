const { DataTypes } = require("sequelize")
const sequelize = require("../db/connection")
const {mod} = require("qrcode/lib/core/polynomial");

const Timetable = sequelize.define(
    "timetable",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        mondayStart: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        mondayEnd: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        tuesdayStart: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        tuesdayEnd: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        wednesdayStart: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        wednesdayEnd: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        thursdayStart: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        thursdayEnd: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        fridayStart: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        fridayEnd: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        saturdayStart: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        saturdayEnd: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        sundayStart: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        sundayEnd: {
            type: DataTypes.TIME,
            allowNull: false,
        },
    },
    {
        underscored: true,
    },
)

module.exports = Timetable;

