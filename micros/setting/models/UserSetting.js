const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// const MUUID = require("uuid-mongodb").mode("canonical");
const UserSettingSchema = new Schema(
  {
    objectId: {
      type: "object",
      value: { type: "Buffer" },
      // default: () => MUUID.v1(),
    },
    createdDate: { type: String },
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
