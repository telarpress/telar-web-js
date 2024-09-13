const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LoginSchema = new Schema(
  {
    password: { type: String },
    responseType: { type: String },
    state: { type: String },
    username: { type: String },
  },
  { collection: "Login" }
);

module.exports = mongoose.model("Login", LoginSchema);
