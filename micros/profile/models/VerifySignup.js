const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const VerifySignupSchema = new Schema(
  {
    code: { type: String },
    responseType: { type: String },
    verificaitonSecret: { type: String },
  },
  { collection: "VerifySignup" }
);

module.exports = mongoose.model("VerifySignup", VerifySignupSchema);
