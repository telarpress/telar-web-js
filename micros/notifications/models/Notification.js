const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const Schema = mongoose.Schema;
const notificationSchema = new Schema(
  {
    objectId: {
      type: "object",
      value: { type: "Buffer" },
      default: uuidv4(),
    },
    ownerUserId: {
      type: "object",
      value: { type: "Buffer" },
    },
    ownerDisplayName: { type: String },
    ownerAvatar: { type: String },
    created_date: { type: Number, default: Math.floor(Date.now() / 1000) },
    title: { type: String },
    description: { type: String },
    url: { type: String },
    notifyRecieverUserId: {
      type: "object",
      value: { type: "Buffer" },
    },
    notifyRecieverEmail: { type: String },
    targetId: {
      type: "object",
      value: { type: "Buffer" },
    },
    isSeen: { type: Boolean },
    type: { type: String },
    emailNotification: { type: Number },
    isEmailSent: { type: Boolean },
  },
  { collection: "notification" }
);

module.exports = mongoose.model("Notification", notificationSchema);
