const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// const MUUID = require("uuid-mongodb").mode("canonical");
const notificationSchema = new Schema(
  {
    objectId: {
      type: "object",
      value: { type: "Buffer" },
      // default: () => MUUID.v1(),
    },
    ownerUserId: {
      type: "object",
      value: { type: "Buffer" },
    },
    ownerDisplayName: { type: String },
    ownerAvatar: { type: String },
    createdDate: { type: Number },
    title: { type: String },
    description: { type: String },
    URL: { type: String },
    notifyRecieverUserId: {
      type: "object",
      value: { type: "Buffer" },
      // default: () => MUUID.v1(),
    },
    notifyRecieverEmail: { type: String },
    targetId: {
      type: "object",
      value: { type: "Buffer" },
      // default: () => MUUID.v1(),
    },
    isSeen: { type: Boolean },
    type: { type: String },
    emailNotification: { type: Number },
    isEmailSent: { type: Boolean },
  },
  { collection: "notification" }
);

module.exports = mongoose.model("Notification", notificationSchema);
