const User = require("../../models/user");

const UsersController = {
  create: (req, res) => {
    User.create(req.body, (err, rows) => {
      res.json(rows);
    });
  },
  getAll: (req, res) => {
    User.getAll((err, rows) => {
      res.json(rows);
    });
  },
  getById: (req, res) => {
    User.getById(req.params.id, (err, rows) => {
      res.json(rows);
    });
  },
  update: (req, res) => {
    User.update(req.params.id, req.body, (err, rows) => {
      res.json(rows);
    });
  },
  delete: (req, res) => {
    User.delete(req.params.id, (err, rows) => {
      res.json(rows);
    });
  }
}

module.exports = UsersController;