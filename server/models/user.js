const { hashSync } = require("bcrypt");
const { DataTypes } = require("sequelize");
const sequelize = require("../db/connection");

const User = sequelize.define(
  "user",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        min: 3,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        min: 8,
      },
      set(value) {
        this.setDataValue("password", hashSync(value, 10));
      },
    },
  },
  {
    underscored: true,
    defaultScope: {
      attributes: {
        exclude: ["password"],
      },
    },
  }
);

module.exports = User;
