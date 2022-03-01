const mysql = require("mysql2");

// Create the connection with the database by using the values from the .env file
const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DB
});

// Attempt to connect to the database
connection.connect();

module.exports = connection;