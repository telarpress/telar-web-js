const app = require("express")();
const db = require("./database");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const bb = require("express-busboy");
const errorService = require("../auth/services/errors");
const authRouter = require("./router");
const { appConfig } = require("../auth/config");
const { appConfig: coreConfig } = require("../../core/config");
const requestIp = require("request-ip");

const allowedOrigins = coreConfig.Origin.split(",").map((d) => d.trim());
const corsOptions = {
  credentials: true,
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(requestIp.mw());
app.use(cors(corsOptions));

bb.extend(app, {
  mimeTypeLimit: ["multipart/form-data"],
});
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: appConfig.SESSION_SECRET_KEY,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  req.time = new Date(Date.now()).toString();
  console.log(req.method, req.hostname, req.body, req.time);
  next();
});
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
