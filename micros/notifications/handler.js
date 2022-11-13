const app = require("express")();
const db = require("./database");
const actionsRouter = require("./router");

// Connect to the database
db.connect();

// Use the router for the Profiles routes
app.use(actionsRouter);

module.exports = app;
