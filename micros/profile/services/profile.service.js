const { appConfig } = require("../config");

const jwt = require("jsonwebtoken");

const UserProfile = require("../models/UserProfile");

exports.getProfileData = async function (userId) {
  return await UserProfile.findOne({ objectId: userId });
};

// IncreaseFollowCount increment follow count of post
exports.increaseFollowCount = async function (objectId, inc) {
  let query = { objectId: objectId };
  const userProfile = await UserProfile.findOne(query);
  return await UserProfile.updateOne(query, {
    followCount: Number(userProfile.followCount) + Number(inc),
  });
};

// IncreaseFollowerCount increment follow count of post
exports.increaseFollowerCount = async function (objectId, inc) {
  let query = { objectId: objectId };
  const userProfile = await UserProfile.findOne(query);
  return await UserProfile.updateOne(query, {
    followerCount: Number(userProfile.followerCount) + Number(inc),
  });
};

// FindProfileByUserIds Find profile by user IDs
exports.findProfileByUserIds = async function (userIds) {
  const sortMap = {};
  const include = {};
  const filter = {};
  sortMap["createdDate"] = -1;
  include["$in"] = userIds; // userIds is an Array
  filter["objectId"] = include;
  return await UserProfile.find(filter).sort(sortMap);
};
exports.updateLastSeenNow = async function (objectId) {
  await UserProfile.findOneAndUpdate(
    { objectId: objectId },
    { lastSeen: Math.floor(Date.now() / 1000) }
  );
};

exports.findBySocialName = function (socialName) {
  return UserProfile.findOne({ socialName: socialName });
};

exports.getProfileById = function (userId) {
  return UserProfile.findOne({ objectId: userId });
};

exports.createUserProfileIndex = async function (postIndexMap) {
  return await UserProfile.createIndexes(postIndexMap);
};
exports.findProfileByAccessToken = async function (token) {
  const decode = jwt.verify(token, appConfig.ACCESS_TPK);
  return await UserProfile.findOne({ objectId: decode.id });
};
exports.checkAccessToken = async function (token) {
  const decode = jwt.verify(token, appConfig.ACCESS_TPK);
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

// CreateProfileHandle handle create a new profile
exports.createDtoProfileHandle = function (profile) {
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
    created_date: Math.floor(Date.now() / 1000),
    last_updated: Math.floor(Date.now() / 1000),
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
