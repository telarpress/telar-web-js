const { appConfig } = require("../config");
const mongoose = require("mongoose");
const log = require("../../../core/utils/errorLogger");
const utils = require("../../../core/utils/error-handler");

exports.connect = async function () {
  let connect;
  switch (appConfig.DB_TYPE) {
    case "mongo":
      connect = await mongoose.connect(appConfig.DB_URI);
      if (!connect) {
        log.Error(connect);
        throw new utils.ErrorHandler(
          "DBError",
          "Problem in MongoDB Connection"
        );
      }
      log.Error("MongoDB Connected");
      break;

    default:
      log.Error("Please set valid database type in confing file!");
      throw new utils.ErrorHandler(
        "DBError",
        "Please set valid database type in confing file!"
      );
  }
};
