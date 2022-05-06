const router = require("express").Router();
const Vote = require("../../models/vote");

// add a new vote for a goal
router.post("/", (req, res) => {
    const { orderId, goalId } = req.body;
    
    Vote.create({
        orderId,
        goalId,
    })
    .then((goal) => {
        res.status(200).json(goal);
    })
    .catch((err) => {
        res.status(500).json(err);
    });
});

module.exports = router;