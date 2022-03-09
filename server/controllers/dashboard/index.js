const router = require("express").Router();

router.get("/", (req, res) => {
  const orders = [
    {
      code: "1938031",
      email: "pete@mail.com",
      state: "Deliverd",
      date: "07-03-2022",
    },
    {
      code: "18751012",
      email: "dave@mail.com",
      state: "Send",
      date: "31-02-2022",
    },
    {
      code: "41515105",
      email: "mike@mail.com",
      state: "Deliverd",
      date: "07-03-2022",
    },
    {
      code: "17571818",
      email: "jim@mail.com",
      state: "Failed",
      date: "31-02-2022",
    },
    {
      code: "15356167",
      email: "erick@mail.com",
      state: "Deliverd",
      date: "15-05-2021",
    },
    {
      code: "24627789",
      email: "richard@mail.com",
      state: "Deliverd",
      date: "02-05-2022",
    },
  ];
  res.render("dashboard/overview", {
    title: "Overzicht - Dashboard",
    orders: orders,
  });
});

router.use("/orders", require("./orders"));

module.exports = router;
