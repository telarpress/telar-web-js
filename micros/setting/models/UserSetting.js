const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { v4: uuidv4 } = require("uuid");
const UserSettingSchema = new Schema(
  {
    objectId: {
      type: "object",
      value: { type: "Buffer" },
      default: uuidv4(),
    },
    created_date: { type: Number, default: Math.floor(Date.now() / 1000) },
    ownerUserId: {
      type: "object",
      value: { type: "Buffer" },
    },
    name: { type: String },
    value: { type: String },
    type: { type: String },
    isSystem: { type: Boolean },
  },
  { collection: "userSetting" }
);

module.exports = mongoose.model("UserSetting", UserSettingSchema);
