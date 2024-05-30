// @ts-nocheck
const { appConfig } = require("../config");
const mongoose = require("mongoose");
const log = require("../../../core/utils/errorLogger");
const utils = require("../../../core/utils/error-handler");

async function connectToMongoDB() {
  try {
    if (!appConfig.DB_URI) {
      throw new Error("The DB_URI is not set");
    }
    await mongoose.connect(appConfig.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Additional options if needed
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error; // Rethrow the error for handling it outside
  }
}

exports.connect = async function () {
  let connect;
  switch (appConfig.DB_TYPE) {
    case "mongo":
      connectToMongoDB();
      break;

    default:
      log.Error("Please set valid database type in confing file!");
      throw new utils.ErrorHandler(
        "DBError",
        "Please set valid database type in confing file!"
      );
  }
};
