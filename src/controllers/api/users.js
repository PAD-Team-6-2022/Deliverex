const get = (req, res) => {
  res.json([{
    id: 69,
    firstName: "John",
    lastName: "Doe"
  }]);
}

module.exports = {
  get
}