const db = require("../db/connection");

const User = {
  create: (data, callback) => {
    db.query(`INSERT INTO users SET name = '${data.name}'`, callback);
  },
  getAll: callback => {
    db.query("SELECT * FROM users", callback);
  },
  getById: (id, callback) => {
    db.query("SELECT * FROM users", callback);
  },
  update: (id, data, callback) => {
    db.query(`UPDATE users SET name = '${data.name}' WHERE id = '${id}'`, callback);
  },
  delete: (id, callback) => {
    db.query(`DELETE FROM users WHERE id = '${id}'`, callback);
  } 
}

module.exports = User;