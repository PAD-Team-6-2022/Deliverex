const express = require("express");
const path = require("path");

// Load environment variables
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// Constants
const PORT = process.env.NODE_ENV === "development" ? 3000 : 80;

// Init express
const app = express();

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views/pages"));

// Serve client files
app.use(express.static(path.join(__dirname, "../client")));

// Set middleware
app.use(express.json());

// Set routes
app.use("/api/users", require("./routes/api/users")); // All API routes are SSR
app.use("/dashboard", require("./routes/dashboard")); // Catch all routes for CSR
app.use("/", require("./routes/tracker")); // Tracker page is a single page and SSR

// Set fallback route
app.get("*", (req, res) => {
  res.status(404).render("error", { title: "404 - Niet gevonden" });
});

// Start server
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
