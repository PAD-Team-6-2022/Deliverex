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
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    username: {
      type: DataTypes.STRING,
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
    workSchedule: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM,
      values: ["ADMIN", "SHOP_OWNER", "COURIER"]
    },
    companyId: {
        type: DataTypes.INTEGER
    }
  },
  {
    underscored: true,
    defaultScope: {
      attributes: {
        exclude: ["password"],
      },
    },
    indexes: [
      {
        fields: ["username"],
        unique: true,
      },
      {
        fields: ["email"],
        unique: true,
      },
    ],
  }
);

module.exports = User;
