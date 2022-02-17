// Load environment variables
require("dotenv").config();

const db = require("../src/db/connection");

const callback = (err, message) => err ? console.log(err.sqlMessage) : console.log(message);

// Make tables
db.query(`
  CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
  )
`, err => callback(err, "Created table 'users'"));