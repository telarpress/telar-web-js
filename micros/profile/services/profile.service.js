const { appConfig } = require("../config");

const jwt = require("jsonwebtoken");

const UserProfile = require("../models/UserProfile");

exports.getProfileData = async function (userId) {
  return await UserProfile.findOne({ objectId: userId });
};

exports.getProfileById = function (userId) {
  return UserProfile.findOne({ objectId: userId });
};
exports.findProfileByAccessToken = async function (token) {
  const decode = jwt.verify(token, appConfig.accessTPK);
  return await UserProfile.findOne({ objectId: decode.id });
};
exports.checkAccessToken = async function (token) {
  const decode = jwt.verify(token, appConfig.accessTPK);
  return await UserProfile.findOne({ objectId: decode.id });
};
exports.getProfiles = function () {
  return UserProfile.find();
};

// generateSocialName
exports.generateSocialName = function (name, uid) {
  return (
    name.toString().replace(" ", "").toLowerCase() +
    uid.toString().split("-")[0]
  );
};

// generateRandomNumber
exports.generateRandomNumber = function (min, max) {
  return Math.floor(Math.random() * max) + min;
};

exports.setProfile = function (profile) {
  const newProfile = new UserProfile({
    socialName: this.generateSocialName(profile.fullName, profile.id),
    objectId: profile.id,
    fullName: profile.fullName,
    email: profile.email,
    // password: profile.password,
    //TODO: Create one ENV for select Account && primary name (email or username)
    // emailUser: profile.email,

    avatar: "https://util.telar.dev/api/avatars/" + profile.id,
    banner: `https://picsum.photos/id/${this.generateRandomNumber(
      1,
      1000
    )}/900/300/?blur`,
    created_date: Date.now(),
    last_updated: Date.now(),
    permission: "user",
  });
  return newProfile.save();
};

exports.updateProfile = async function (profile) {
  const {
    objectId,
    fullName,
    socialName,
    avatar,
    banner,
    tagLine,
    created_date,
    last_updated,
    lastSeen,
    email,
    birthday,
    webUrl,
    country,
    address,
    school,
    liveLocation,
    phone,
    lang,
    companyName,
    voteCount,
    shareCount,
    followCount,
    followerCount,
    postCount,
    facebookId,
    instagramId,
    twitterId,
    linkedInId,
    accessUserList,
    permission,
  } = profile;

  await UserProfile.findOneAndUpdate(
    { objectId },
    {
      fullName,
      socialName,
      avatar,
      banner,
      tagLine,
      created_date,
      last_updated,
      lastSeen,
      email,
      birthday,
      webUrl,
      country,
      address,
      school,
      liveLocation,
      phone,
      lang,
      companyName,
      voteCount,
      shareCount,
      followCount,
      followerCount,
      postCount,
      facebookId,
      instagramId,
      twitterId,
      linkedInId,
      accessUserList,
      permission,
    }
  );

  return await UserProfile.findOne({ objectId });
};
