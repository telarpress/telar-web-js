const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserVerificationTokenSchema = new Schema({
  objectId: { type: String, required: true },
  code: { type: String, required: true },
  target: { type: String, required: true },
  targetType: { type: String, required: true },
  counter: { type: Number, default: 0 },
  created_date: { type: Date, default: Date.now },
  remoteIpAddress: { type: String, required: true },
  userId: { type: String, required: true, trim: true, unique: true },
  isVerified: { type: Boolean, required: true, default: false },
  last_updated: { type: Date, default: Date.now },
});

module.exports = mongoose.model("UserToken", UserVerificationTokenSchema);
