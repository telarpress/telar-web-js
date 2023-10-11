const app = require("express")();
const db = require("./database");
const storageRouter = require("./router");

// Connect to the database
db.connect();

// Use the router for the storage routes
app.use(storageRouter);

module.exports = app;
