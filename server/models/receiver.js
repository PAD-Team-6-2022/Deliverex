const { DataTypes } = require("sequelize");
const sequelize = require("../db/connection");

const Receiver = sequelize.define(
  "receiver",
  {
    countryIso: {
      type: DataTypes.CHAR(2),
      allowNull: false,
    },
    countryName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    provinceName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cityName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    streetName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    houseNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    postalCode: {
      type: DataTypes.STRING(10),
      allowNull: false,
      primaryKey: true,
    },
    addressName: {
      type: DataTypes.VIRTUAL,
      get() {
        return `${this.streetName} ${this.houseNumber}, ${this.postalCode}, ${this.cityName}, ${this.countryName}`;
      },
      set() {
        throw new Error("Do not try to set the `address` value!");
      },
    },
  },
  {
    underscored: true,
  }
);

module.exports = Receiver;
