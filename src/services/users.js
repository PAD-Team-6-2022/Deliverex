const User = require("../models/user");

const UsersService = {
  create: body => new Promise((resolve, reject) => {
    User.create(body, (err, rows) => {
      if(err) reject(err.sqlMessage);
      else resolve(rows);
    });
  }),
  getAll: () => new Promise((resolve, reject) => {
    User.getAll((err, rows) => {
      if(err) reject(err.sqlMessage);
      else resolve(rows);
    });
  }),
  getById: id => new Promise((resolve, reject) => {
    User.getById(id, (err, rows) => {
      if(err) reject(err.sqlMessage);
      else resolve(rows);
    });
  }),
  update: (id, body) => new Promise((resolve, reject) => {
    User.update(id, body, (err, rows) => {
      if(err) reject(err.sqlMessage);
      else resolve(rows);
    });
  }),
  remove: id => new Promise((resolve, reject) => {
    User.remove(id, (err, rows) => {
      if(err) reject(err.sqlMessage);
      else resolve(rows);
    });
  })
}

module.exports = UsersService;