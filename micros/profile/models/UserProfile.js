const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const Schema = mongoose.Schema;
const ProfilesSchema = new Schema(
  {
    avatar: { type: String },
    banner: { type: String },
    birthday: { type: Number },
    companyName: { type: String },
    created_date: { type: Number, default: Math.floor(Date.now() / 1000) },
    email: { type: String },
    facebookId: { type: String },
    followCount: { type: Number, default: 0 },
    followerCount: { type: Number, default: 0 },
    fullName: { type: String },
    instagramId: { type: String },
    objectId: { type: String, default: uuidv4() },
    last_updated: { type: Number, default: Math.floor(Date.now() / 1000) },
    permission: {
      type: String,
      enum: ["OnlyMe", "Public", "Circles", "Custom"],
      default: "Public",
    },
    postCount: { type: Number, default: 0 },
    shareCount: { type: Number },
    socialName: { type: String },
    tagLine: { type: String },
    twitterId: { type: String },
    voteCount: { type: Number, default: 0 },
    webUrl: { type: String },

    lastSeen: { type: Number },
    country: { type: String },
    address: { type: String },
    school: { type: String },
    liveLocation: { type: String },
    phone: { type: String },
    lang: { type: String, default: "en" },
    shareCount: { type: Number, default: 0 },
    linkedInId: { type: String },
    accessUserList: { type: [String], default: null },
  },
  { collection: "userProfile" }
);

module.exports = mongoose.model("UserProfile", ProfilesSchema);
