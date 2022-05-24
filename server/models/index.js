const Format = require('./format');
const Order = require('./order');
const Package = require('./package');
const Receiver = require('./receiver');
const Session = require('./session');
const User = require('./user');
const Company = require('./company');
const Location = require('./location');
const Goal = require('./goal');
const Vote = require('./vote');
const Donation = require('./donation');
const Organisation = require('./organisation');
const WeekSchedule = require('./week_schedule');

User.hasMany(Format);
Format.belongsTo(User);

Format.hasMany(Order);
Order.belongsTo(Format);

User.hasMany(Order);
Order.belongsTo(User, { as: 'userCreated', foreignKey: 'created_by' });
Order.belongsTo(User, { as: 'courier', foreignKey: 'courier_id' });

WeekSchedule.hasOne(User);
User.belongsTo(WeekSchedule, { as: 'schedule', foreignKey: 'schedule_id' });

Company.hasMany(User);
User.belongsTo(Company, { as: 'company', foreignKey: 'company_id' });

Location.hasOne(Company);
Company.belongsTo(Location, { as: 'location', foreignKey: 'location_id' });

Goal.hasMany(Vote);
Vote.belongsTo(Goal);

Order.hasOne(Vote);
Vote.belongsTo(Order);

Goal.hasMany(Donation);
Donation.belongsTo(Goal);

Order.hasOne(Donation);
Donation.belongsTo(Order);

User.hasOne(Timetable);
Timetable.belongsTo(User);

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
    Donation,
    Organisation,
    WeekSchedule,
};
