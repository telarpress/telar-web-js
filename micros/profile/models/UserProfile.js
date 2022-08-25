const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProfilesSchema = new Schema({
  objectId: { type: String },
  fullName: { type: String },
  socialName: { type: String },
  avatar: { type: String },
  banner: { type: String },
  tagLine: { type: String },
  created_date: { type: Date, default: Date.now },
  last_updated: { type: Date, default: Date.now },
  lastSeen: { type: String },
  email: { type: String },
  birthday: { type: String },
  webUrl: { type: String },
  country: { type: String },
  address: { type: String },
  school: { type: String },
  liveLocation: { type: String },
  phone: { type: String },
  lang: { type: String, default: "en" },
  companyName: { type: String },
  voteCount: { type: String },
  shareCount: { type: String },
  followCount: { type: String },
  followerCount: { type: String },
  postCount: { type: String },
  facebookId: { type: String },
  instagramId: { type: String },
  twitterId: { type: String },
  linkedInId: { type: String },
  accessUserList: { type: String },
  permission: {
    type: [String],
    enum: ["user", "admin", "super_admin"],
    default: ["user"],
  },
});

module.exports = mongoose.model("UserProfile", ProfilesSchema);
