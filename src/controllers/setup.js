const SetupController = {
    index: (req, res) => {
        res.render("setup", { title: "Setup" })
    }
}

module.exports = SetupController;