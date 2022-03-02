const mysql = require("mysql2");

// Create the connection with the database by using the values from the .env file
const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DB
});

// Attempt to connect to the database
const connect = () => {
  connection.connect(err => {
    if(err) console.log("There was an error trying to connect to the database:", err);
    setTimeout(connect, 2000);
  });
  connection.on("error", err => {
    console.log("There was an error with the database:", err);

    if(err.code === "PROTOCOL_CONNECTION_LOST") {
      connect();
    } else {
      throw err;
    }
  });
}
connect();

module.exports = connection;