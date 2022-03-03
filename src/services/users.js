const User = require("../models/user");
const { hashSync } = require("bcrypt");

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
   * @param {object} body json body to pass on
   * @returns the newly created user entity.
   */
  create: async (username, password) => {
    const newUser = await User.create({
      username,
      password
    });

    return newUser.toJSON();
  },
  /**
   * Get all users form the database.
   * 
   * @returns all users entities from the database.
   */
  getAll: async () => {
    return await User.findAll();
  },
  /**
   * Get a specific user from the database by id.
   * 
   * @param {number} id of the user you want to fetch.
   * @returns the fetched user entity.
   */
  getById: async id => {
    return await User.findOne({
      where: { id }
    });
  },
  /**
   * Get a specific user from the database by its username.
   * 
   * @param {string} username of the user you want to fetch.
   * @returns the fetches user entity.
   */
  getByUsername: async username => {
    return await User.findOne({
      where: { username }
    });
  },
  /**
   * Update a user in the database by id.
   * 
   * @param {number} id the id of the user.
   * @param {object} body the data you want to update.
   * @returns the updated user entity.
   */
  update: async (id, body) => {
    return await User.update(body, {
      where: { id }
    });
  },
  /**
   * Remove a user from the database by id.
   * 
   * @param {number} id of the user you want to delete.
   * @returns the query result object.
   */
  remove: async id => {
    return await User.destroy({
      where: { id }
    });
  }
}

module.exports = UsersService;