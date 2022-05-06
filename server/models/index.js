const Format = require("./format");
const Order = require("./order");
const Package = require("./package");
const Receiver = require("./receiver");
const Session = require("./session");
const User = require("./user");
const Company = require("./company");
const Location = require("./location");
const Goal = require("./goal");
const Vote = require("./vote");

User.hasMany(Format);
Format.belongsTo(User);

Format.hasMany(Order);
Order.belongsTo(Format);

User.hasMany(Order);
Order.belongsTo(User);

Goal.hasMany(Vote);
Order.hasOne(Vote);
Vote.belongsTo(Order);
Vote.belongsTo(Goal);

// Location.belongsTo(Company)

module.exports = {
    Format,
    Order,
    Package,
    Receiver,
    Session,
    User,
    Company,
    Location,
    Goal,
    Vote,
};