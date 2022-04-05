const { DataTypes } = require("sequelize");
const sequelize = require("../db/connection");

const Format = sequelize.define(
    "format",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nameformat: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        length: {
            type: DataTypes.DOUBLE,
            allowNull: false,
        },
        width: {
            type: DataTypes.DOUBLE,
            allowNull: false,
        },
        height: {
            type: DataTypes.DOUBLE,
            allowNull: false,
        },

    },
    {
        underscored: true,
    }
);

module.exports = Format;
