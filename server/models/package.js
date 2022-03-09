const { DataTypes } = require("sequelize");
const sequelize = require("../db/connection");

const Package = sequelize.define(
  "package",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
  },
  { underscored: true }
);

module.exports = Package;
