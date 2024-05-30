const app = require("express")();
const db = require("./database");
const settingRouter = require("./router");
const { appConfig: coreConfig } = require("../../core/config");
const requestIp = require("request-ip");
const cors = require("cors");

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
// Connect to the database
db.connect();

// Use the router for the Profiles routes
app.use(settingRouter);

module.exports = app;
