const express = require("express");
const path = require("path");

// Load environment variables
require("dotenv").config();

// Import routes
const UserRouter = require("./routes/api/users");
const DashboardRouter = require("./routes/dashboard");
const TrackerRouter = require("./routes/tracker");

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
app.use("/api/users", UserRouter);
app.use("/dashboard", DashboardRouter);
app.use("/", TrackerRouter);

// Start server
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));