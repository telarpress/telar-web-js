const app = require("express")();
const db = require("./database");
const adminRouter = require("./router");

// Connect to the database
db.connect();

// Use the router for the Profiles routes
app.use(adminRouter);
// View Engine
const cons = require("consolidate");
app.engine("html", cons.mustache);
app.set("view engine", "html");
app.set("views", __dirname + "/views");
module.exports = app;
