// Load environment variables
require("dotenv").config();

const db = require("../src/db/connection");

const callback = (err, message) => err ?
  console.log(err.sqlMessage) :
  console.log(message);

// Make tables
db.query(`
  CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(16) UNIQUE KEY NOT NULL,
    password VARCHAR(255) NOT NULL
  )
`, err => callback(err, "Created table 'users'"));

db.query(`
    CREATE TABLE orders (
      id INT AUTO_INCREMENT PRIMARY KEY
    )
`, err => callback(err, "Created table 'orders'"));

db.query(`
    CREATE TABLE packages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT(11) UNIQUE KEY NOT NULL,
      weight DECIMAL(8,2) NOT NULL,
      CONSTRAINT fk_orders FOREIGN KEY (order_id) REFERENCES orders (id) ON UPDATE CASCADE ON DELETE CASCADE
    )
`, err => callback(err, "Created table 'packages'"));

// Closing connection
db.end();