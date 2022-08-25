const app = require("express")();
const db = require("./database");
const session = require("express-session");
const passport = require("passport");

const errorService = require("../auth/services/errors");
const authRouter = require("./router");
const { appConfig } = require("../auth/config");
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: appConfig.SESSION_SECRET_KEY,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use("/auth", require("../auth/router/googleOauth"));

app.use(authRouter);
app.use(errorService);

db.connect();
app.disable("x-powered-by");

// View Engine
const cons = require("consolidate");
app.engine("html", cons.mustache);
app.set("view engine", "html");
app.set("views", __dirname + "/views");

module.exports = app;
