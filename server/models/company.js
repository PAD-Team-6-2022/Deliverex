const { DataTypes } = require("sequelize");
const sequelize = require("../db/connection");

const Company = sequelize.define(
    "company",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true,
            },
        },
        location_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        logo: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        percentageToGoal: {
            type: DataTypes.STRING,
            allowNull: false,
        },

    },
    {
        underscored: true,
    }
);

module.exports = Company;
