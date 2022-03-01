const TrackerController = {
  index: (req, res) => {
    res.render("tracker", { title: "Track & Trace" });
  }
}

module.exports = TrackerController;