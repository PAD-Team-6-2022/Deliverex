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

// Set controllers
app.use("/dashboard", require("./controllers/dashboard"));
app.use("/setup", require("./controllers/setup"));
app.use("/", require("./controllers/tracker"));
app.use("/api/users", require("./controllers/api/users"));
app.use("/api/orders", require("./controllers/api/orders"));

// Set fallback route
app.get("*", (req, res) => {
  res.status(404).render("error", { title: "404 - Niet gevonden" });
});

// Start server
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
