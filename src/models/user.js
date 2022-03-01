const db = require("../db/connection");

/**
 * This model includes all CRUD functions
 * to interact with the database with.
 * 
 * NOTICE:
 * These modals might change as to how they work.
 * Might be able to make an abstract implementation
 * to interact with many tables without duplicating
 * boilerplate code to all models.
 * 
 * @author Team 6
 * @since 1.0
 */
const User = {
  /**
   * Create a new user in the database.
   * 
   * @param {object} data the data you want to pass on.
   * @param {function} callback use this callback to handle the newly created entity and occuring errors.
   */
  create: (data, callback) => {
    db.query(`INSERT INTO users SET name = '${data.name}'`, callback);
  },
  /**
   * Get all users form the database.
   * 
   * @param {function} callback use this callback to handle the fetches entities and occuring errors
   */
  getAll: callback => {
    db.query("SELECT * FROM users", callback);
  },
  /**
   * Get a specific user from the database by id.
   * 
   * @param {number} id of the user you want to fetch.
   * @param {function} callback use this callback to handle the fetches entity and occuring errors.
   */
  getById: (id, callback) => {
    db.query(`SELECT * FROM users WHERE id = '${id}'`, callback);
  },
  /**
   * 
   * @param {number} id of the user you want to update.
   * @param {object} data the data you want to update.
   * @param {function} callback use this callback to handle the updated entity and occuring errors.
   */
  update: (id, data, callback) => {
    db.query(`UPDATE users SET name = '${data.name}' WHERE id = '${id}'`, callback);
  },
  /**
   * Remove a user from the database by id.
   * 
   * @param {number} id of the user you want to remove
   * @param {function} callback use this callback to handle the query result and occuring errors.
   */
  remove: (id, callback) => {
    db.query(`DELETE FROM users WHERE id = '${id}'`, callback);
  } 
}

module.exports = User;