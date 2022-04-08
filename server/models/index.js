const Format = require("./format");
const Order = require("./order");
const Package = require("./package");
const Receiver = require("./receiver");
const Session = require("./session");
const User = require("./user");

User.hasMany(Format);
Format.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

module.exports = {
    Format,
    Order,
    Package,
    Receiver,
    Session,
    User,
};