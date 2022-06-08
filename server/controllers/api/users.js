const router = require('express').Router();
const { User } = require('../../models');

router.post('/', async (req, res) => {
    const { username, email, password, role } = req.body;

    try {
        const user = await User.create({
            username,
            email,
            password,
            role,
        });

        res.status(201).json({
            success: true,
            data: user,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            success: false,
            message: 'No user id provided',
        });
    }

    try {
        const user = User.findOne({
            where: {
                id: req.params.id,
            },
        });

        if (user) {
            res.status(200).json({
                success: true,
                data: user,
            });
        } else {
            res.status(404).json({
                success: false,
                message: "Couldn't find user",
            });
        }
    } catch (err) {
        res.status(404).json({
            success: false,
            message: err.message,
        });
    }
});

router.get('/', async (req, res) => {
    try {
        const users = await User.findAll();

        res.status(200).json({
            success: true,
            data: users,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await User.destroy({
            where: {
                id: req.params.id,
            },
        });

        res.status(200).json({
            success: true,
            message: 'Successfully deleted user',
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: `Something went wrong while trying to delete the user: ${err}`,
        });
    }
});

module.exports = router;
