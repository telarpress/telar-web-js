const { appConfig } = require("../config");
const mongoose = require("mongoose");
const log = require("../utils/errorLogger");
const utils = require("../utils/error-handler");

exports.connect = async function () {
  let connect;
  switch (appConfig.DB_TYPE) {
    case "MONGO":
      connect = await mongoose.connect(appConfig.DB_URI);
      if (!connect) {
        log.Error(connect);
        throw new utils.ErrorHandler(
          "DBError",
          "Problem in MongoDB Connection"
        );
      }
      console.log("MongoDB Connected");
      break;

    default:
      log.Error("Please set valid database type in confing file!");
      throw new utils.ErrorHandler(
        "DBError",
        "Please set valid database type in confing file!"
      );
  }
};
