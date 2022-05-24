const { hashSync } = require('bcrypt');
const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');

const UserInvite = sequelize.define(
    'userInvite',
    {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true,
            },
        },
        code: {
            type: DataTypes.CHAR(6),
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM,
            values: ['SHOP_OWNER', 'COURIER'],
        },
    },
    {
        underscored: true,
    },
);

module.exports = User;
