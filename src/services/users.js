const User = require("../models/user");

/**
 * This is a CRUD-service that
 * interacts with the user model.
 * 
 * @author Team 6
 * @since 1.0
 */
const UsersService = {
  /**
   * Create a new user in the database.
   * 
   * @param {string} body json body to pass on
   * @returns the newly created user entity.
   */
  create: body => new Promise((resolve, reject) => {
    User.create(body, (err, rows) => {
      if(err) reject(err.sqlMessage);
      else resolve(rows);
    });
  }),
  /**
   * Get all users form the database.
   * 
   * @returns all users entities from the database.
   */
  getAll: () => new Promise((resolve, reject) => {
    User.getAll((err, rows) => {
      if(err) reject(err.sqlMessage);
      else resolve(rows);
    });
  }),
  /**
   * Get a specific user from the database by id.
   * 
   * @param {number} id of the user you want to fetch.
   * @returns the fetched user entity.
   */
  getById: id => new Promise((resolve, reject) => {
    User.getById(id, (err, rows) => {
      if(err) reject(err.sqlMessage);
      else resolve(rows);
    });
  }),
  /**
   * Update a user in the database by id.
   * 
   * @param {number} id the id of the user.
   * @param {string} body the data you want to update.
   * @returns the updated user entity.
   */
  update: (id, body) => new Promise((resolve, reject) => {
    User.update(id, body, (err, rows) => {
      if(err) reject(err.sqlMessage);
      else resolve(rows);
    });
  }),
  /**
   * Remove a user from the database by id.
   * 
   * @param {number} id of the user you want to delete.
   * @returns the query result object.
   */
  remove: id => new Promise((resolve, reject) => {
    User.remove(id, (err, rows) => {
      if(err) reject(err.sqlMessage);
      else resolve(rows);
    });
  })
}

module.exports = UsersService;