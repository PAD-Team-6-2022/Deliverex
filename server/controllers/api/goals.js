const router = require("express").Router();
const Goal = require("../../models/goal");

// create a new Goal suggestion
router.post("/", (req, res) => {
    const { email, title, description, amount } = req.body;
    
    Goal.create({
      suggested_by: email,
      title,
      amount,
      description,
      status: "SUGGESTION"
    })
    .then((goal) => {
        res.status(200).json(goal);
    })
    .catch((err) => {
        res.status(500).json(err);
    });
});

module.exports = router;