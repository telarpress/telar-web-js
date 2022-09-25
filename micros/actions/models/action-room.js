const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// const MUUID = require("uuid-mongodb").mode("canonical");
const actionRoomSchema = new Schema(
  {
    objectId: {
      type: "object",
      value: { type: "Buffer" },
      // default: () => MUUID.v1(),
    },
    created_date: { type: Number },
    ownerUserId: {
      type: "object",
      value: { type: "Buffer" },
    },
    privateKey: { type: String },
    accessKey: { type: String },
    status: { type: Number },
  },
  { collection: "actionRoom" }
);

module.exports = mongoose.model("actionRoom", actionRoomSchema);
