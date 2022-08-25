const { appConfig } = require("../config");
const mongoose = require("mongoose");
exports.connect = async () => {
  console.log(appConfig.DB_URI);
  const connect = await mongoose.connect(appConfig.DB_URI);
  if (!connect) console.log(connect);
  console.log("MongoDB Connected");
};
