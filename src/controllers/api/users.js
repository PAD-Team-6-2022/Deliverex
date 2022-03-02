const { Response, Request } = require("express");
const UsersService = require("../../services/users");

/**
 * The controller used to handle
 * all the users api logic.
 * 
 * @author Team 6
 * @since 1.0
 */
const UsersController = {
  /**
   * Render the result of creating a new user.
   * 
   * @param {Request} req the request object.
   * @param {Response} res the response object.
   */
  create: async (req, res) => {
    res.json(await UsersService.create(req.body.username, req.body.password));
  },
  /**
   * Render the result of getting all users.
   * 
   * @param {Request} req the request object.
   * @param {Response} res the response object.
   */
  getAll: async (req, res) => {
    res.json(await UsersService.getAll());
  },
  /**
   * Render the result of getting a user by username.
   * 
   * @param {Request} req the request object.
   * @param {Response} res the response object.
   */
  getByUsername: async (req, res) => {
    console.log("Test");
    res.json(await UsersService.getByUsername(req.params.username));
  },
  /**
   * Render the result of updating a user.
   * 
   * @param {Request} req the request object.
   * @param {Response} res the response object.
   */
  update: async (req, res) => {
    res.json(await UsersService.update(req.params.id, req.body));
  },
  /**
   * Render the result of removing a user.
   * 
   * @param {Request} req the request object.
   * @param {Response} res the response object.
   */
  remove: async (req, res) => {
    res.json(await UsersService.remove(req.params.id));
  }
}

module.exports = UsersController;