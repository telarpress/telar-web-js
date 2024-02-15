const { string } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// const MUUID = require("uuid-mongodb").mode("canonical");
const storageSchema = new Schema(
  {
    objectId: {
      type: "object",
      value: { type: "Buffer" },
      // default: () => MUUID.v1(),
    },
    asset_id: { type: String },
    dir: { type: String },
    public_id: { type: String },
    width: { type: Number },
    height: { type: Number },
    format: { type: String },
    resource_type: { type: String },
    bytes: { type: Number },
    url: { type: String },
    folder: { type: String },
    created_date: { type: Number, default: Math.floor(Date.now() / 1000) },
    permission: {
      type: [String],
      enum: ["OnlyMe", "Public", "Circles"],
      default: ["Public"],
    },
  },
  { collection: "storage" }
);

module.exports = mongoose.model("storage", storageSchema);
