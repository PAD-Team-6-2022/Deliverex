const UsersService = require("../../services/users");

const UsersController = {
  create: async (req, res) => {
    res.json(await UsersService.create(req.body));
  },
  getAll: async (req, res) => {
    res.json(await UsersService.getAll());
  },
  getById: async (req, res) => {
    res.json(await UsersService.getById(req.params.id));
  },
  update: async (req, res) => {
    res.json(await UsersService.update(req.params.id, req.body));
  },
  remove: async (req, res) => {
    res.json(await UsersService.remove(req.params.id));
  }
}

module.exports = UsersController;