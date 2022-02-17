const express = require("express");
const path = require("path");

// Load environment variables
require("dotenv").config();

// Import routes
const usersRoutes = require("./routes/api/users");
const dashboardRoutes = require("./routes/dashboard");
const trackerRoutes = require("./routes/tracker");

// Constants
const PORT = process.env.NODE_ENV === "development" ? 3000 : 80;

// Init express
const app = express();

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views/pages"));

// Set middleware
app.use(express.json());

// Set routes
app.use("/api/users", usersRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/", trackerRoutes);

// Start server
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));