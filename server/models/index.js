const Format = require("./format");
const Order = require("./order");
const Package = require("./package");
const Receiver = require("./receiver");
const Session = require("./session");
const User = require("./user");
const Company = require("./company");
const Location = require("./location");
const Organisation = require("./organisation");

User.hasMany(Format);
Format.belongsTo(User);

Format.hasMany(Order);
Order.belongsTo(Format);

User.hasMany(Order);
Order.belongsTo(User, {as: 'userCreated',foreignKey: 'created_by'});
Order.belongsTo(User, {as: 'courier', foreignKey: 'courier_id'});

Company.hasMany(User);
User.belongsTo(Company, {as: 'company', foreignKey: 'company_id'});

Location.hasOne(Company);
Company.belongsTo(Location, {as: 'location', foreignKey: 'location_id'});

module.exports = {
    Format,
    Order,
    Package,
    Receiver,
    Session,
    User,
    Company,
    Location,
};