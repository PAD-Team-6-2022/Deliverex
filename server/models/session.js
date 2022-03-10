const { DataTypes } = require("sequelize");
const sequelize = require("../db/connection");

const Session = sequelize.define(
  "session",
  {
    id: {
      type: DataTypes.STRING(32),
      primaryKey: true,
    },
    data: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  { underscored: true }
);

module.exports = Session;
