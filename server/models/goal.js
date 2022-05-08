const { DataTypes } = require("sequelize");
const sequelize = require("../db/connection");

const Goal = sequelize.define(
    "goal",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        amount: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: false,
        },
        suggested_by: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
              isEmail: true,
            },
          },
        status: {
            type: DataTypes.ENUM,
            values: ["COMPLETED", "CURRENT", "ACTIVE", "INACTIVE", "SUGGESTION"],
            allowNull: false,
        }
    },
    {
        underscored: true,
    }
);

module.exports = Goal;
