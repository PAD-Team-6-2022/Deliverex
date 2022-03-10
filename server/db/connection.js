const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "mysql",
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  logging: false,
});

const init = async () => {
  sequelize
    .authenticate()
    .then(() => {
      console.log("The database was succesfully connected");

      if (process.env.NODE_ENV === "development") {
        console.log("Attempting to sync database...");

        sequelize
          .sync({
            alter: true,
          })
          .then(() => {
            console.log("All models were succesfully synced with the database");
          });
      }
    })
    .catch((err) => console.error("Unable to connect to the database:", err));
};

init();

module.exports = sequelize;
