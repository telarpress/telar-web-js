const app = require("express")();
const db = require("./database");
const userRouter = require("./router");

// Connect to the database
db.connect();

// Use the router for the Profiles routes
app.use(userRouter);

module.exports = app;
