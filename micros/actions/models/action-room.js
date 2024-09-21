const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { v4: uuidv4 } = require("uuid");
const actionRoomSchema = new Schema(
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
    privateKey: { type: String },
    accessKey: { type: String },
    status: { type: Number },
  },
  { collection: "actionRoom" }
);

module.exports = mongoose.model("actionRoom", actionRoomSchema);
