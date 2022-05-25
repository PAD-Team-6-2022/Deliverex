const { hashSync } = require('bcrypt');
const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');

const User = sequelize.define(
    'user',
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
            validate: {
                min: 3,
            },
        },
        password: {
            type: DataTypes.STRING,
            validate: {
                min: 8,
            },
            set(value) {
                this.setDataValue('password', hashSync(value, 10));
            },
        },
        role: {
            type: DataTypes.ENUM,
            values: ['ADMIN', 'SHOP_OWNER', 'COURIER'],
        },
        scheduleId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        companyId: {
            type: DataTypes.INTEGER,
        },
    },
    {
        underscored: true,
        defaultScope: {
            attributes: {
                exclude: ['password'],
            },
        },
        paranoid: true,
        indexes: [
            {
                fields: ['username'],
                unique: true,
            },
            {
                fields: ['email'],
                unique: true,
            },
        ],
    },
);

module.exports = User;
