const { Response, Request } = require("express");
const { restart } = require("nodemon");
const User = require("../../models/user");

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
    const { username, password } = req.body;

    try {
      const newUser = await User.create({
        username,
        password
      });
      delete newUser.dataValues.password; // remove password from result
      res.status(200).json(newUser);
    } catch (err) {
      res.status(500).json(err);
    }
  },
  findOne: async (req, res) => {
    try {
      res.status(200).json(await User.findOne({ where: {
        id: req.params.id
      }, attributes: {
        exclude: ["password"]
      }}));
    } catch (err) {
      res.status(404).json(err);
    }
  },
  findAll: async (req, res) => {
    try {
      res.status(200).json(await User.findAll({ attributes: {
        exclude: ["password"]
      }}));
    } catch (err) {
      res.status(500).json(err);
    }
  },
  destroy: async (req, res) => {
    try {
      res.status(200).json(await User.destroy({ where: {
        id: req.params.id
      }}));
    } catch (err) {
      res.status(500).json(err);
    }
  }
}

module.exports = UsersController;