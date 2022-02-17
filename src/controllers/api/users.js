const User = require("../../models/user");

const get = (req, res) => {
  User.getAll((err, rows) => {
    res.json(rows);
  });
}

module.exports = {
  get
}