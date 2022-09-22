const app = require("express")();
const db = require("./database");
const settingRouter = require("./router");

// Connect to the database
db.connect();

// Use the router for the Profiles routes
app.use(settingRouter);

module.exports = app;
