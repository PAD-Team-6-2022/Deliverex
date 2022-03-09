const router = require("express").Router();
const User = require("../../models/user");

router.post("/", (req, res) => {
  const { email, username, password } = req.body;

  User.create({
    email,
    username,
    password,
  })
    .then((user) => {
      delete user.dataValues.password; // remove password from result
      res.status(200).json(user);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

router.get("/:id", (req, res) => {
  User.findOne({
    where: {
      id: req.params.id,
    },
  }).then((user) => {
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json(err);
    }
  });
});

router.get("/", (req, res) => {
  User.findAll()
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

router.delete("/:id", (req, res) => {
  User.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then((result) => {
      res.status(200).json({
        message: "Successfully deleted user",
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: `Something went wrong while trying to delete the user: ${err}`,
      });
    });
});

module.exports = router;
