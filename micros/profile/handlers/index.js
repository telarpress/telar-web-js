// const { ajv } = require("../validation");
// const validate_getID = ajv.getSchema("getID");
// const validate_setData = ajv.getSchema("setData");
const hmac = require("../utils/hmac");
const { appConfig } = require("../config");
const log = require("../utils/errorLogger");
const utils = require("../utils/error-handler");
const { HttpStatusCode } = require("../utils/HttpStatusCode");
const profileService = require("../services/profile.service");

// ReadMyProfileHandle a function invocation to read authed user profile
exports.readMyProfileHandle = async function (req, res) {
  const token = req.cookies.token;
  if (!token) {
    log.Error("GetProfileHandle: Get Profile Problem");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "profile.missingGetProfile",
          "Missing Get Profile"
        ).json()
      );
  }
  try {
    const findProfile = await profileService.findProfileByAccessToken(token);
  } catch (error) {
    if (error == "TokenExpiredError: jwt expired")
      return res.redirect("/auth/login");
    log.Error("ResetPassHandle: Find Profile Problem " + error);
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "auth.missingloginFind",
          "Missing Find Profile"
        ).json()
      );
  }
  return res.status(HttpStatusCode.OK).send(findProfile).json();
};

// GET /UserProfile
exports.getProfileData = async function (req, res) {
  const profile = await profileService.getProfileData(req.params.id);
  if (!profile) {
    log.Error("getProfileDataHandle: Error happened in get data from profile!");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "profile.getprifiledatamissing",
          "get profile data missing"
        ).json()
      );
  }
  return profile;
};

// GET Profile
exports.getProfile = async function (req, res) {
  const token = req.cookies.token;
  if (!token) {
    log.Error("GetProfileHandle: Get Profile Problem");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "profile.missingGetProfile",
          "Missing Get Profile"
        ).json()
      );
  }
  try {
    const findProfile = await profileService.findProfileByAccessToken(token);
  } catch (error) {
    if (error == "TokenExpiredError: jwt expired")
      return res.redirect("/auth/login");
    log.Error("ResetPassHandle: Find Profile Problem " + error);
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "auth.missingloginFind",
          "Missing Find Profile"
        ).json()
      );
  }
  return res.status(HttpStatusCode.OK).send(findProfile).json();
};

// GET All Profiles
exports.getProfiles = async function (req, res) {
  const getProfiles = await profileService.getProfiles();
  if (!getProfiles) res.status(404).json({ msg: "No profile found" });
  res.send(getProfiles);
};

// GET /Profile/:id
exports.getProfileById = async function (req, res) {
  const token = req.cookies.token;
  const profileId = req.params.id;
  console.log(profileId);
  if (!token) {
    log.Error("GetProfileHandle: Get Profile Problem");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "profile.missingGetProfile",
          "Missing Get Profile"
        ).json()
      );
  }

  try {
    await profileService.checkAccessToken(token);
  } catch (error) {
    res.clearCookie("token");
    res.clearCookie("refreshToken");
    return res.redirect("/auth/");
  }

  try {
    const profile = await profileService.getProfileData(profileId);
    return res.send(profile);
  } catch (error) {
    log.Error(`getProfileById: Get Profile Problem ${error}`);
    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        new utils.ErrorHandler(
          "profile.missingGetProfile",
          "Missing Get Profile"
        ).json()
      );
  }
};

// POST /profile
exports.setProfile = async (req, res) => {
  let hash = req.header(appConfig.HMAC_HEADER_NAME);
  const HMAC_Validation = await hmac.validate(
    JSON.stringify(req.body),
    appConfig.HMAC_SECRET_KEY,
    hash
  );

  if (!HMAC_Validation)
    return res.send(`Error while Save User: ${HMAC_Validation}`);

  if (req.body) {
    // if (validate_setData(req.body)) {
    profileService.setProfile(req.body);
    res.send("User has been added to Profile microservice service");
  } else {
    log.Error(
      `setProfile: Set Profile Problem `
      // ${JSON
      //   .stringify
      //   // validate_setData.errors
      //   ()}
    );
    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        new utils.ErrorHandler(
          "profile.missingSetProfile",
          "Missing Set Profile"
        ).json()
      );
  }
};

// PUT update /profile
exports.updateProfile = async function (req, res) {
  const token = req.cookies.token;
  console.log(token);
  if (!token) {
    log.Error("UpdateProfileHandle: Update Profile Problem");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "profile.missingUpdateProfile",
          "Missing Update Profile"
        ).json()
      );
  }
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
  } = req.body;
  const profile = await profileService.findProfileByAccessToken(token);

  if (!(profile.objectId === objectId)) {
    log.Error("updateProfile: Update Profile Problem");
    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        new utils.ErrorHandler(
          "profile.missingUpdateProfile",
          "Missing Update Profile"
        ).json()
      );
  }
  //TODO: if Admin
  profile.objectId = objectId;
  profile.fullName = fullName;
  profile.socialName = socialName;
  profile.avatar = avatar;
  profile.banner = banner;
  profile.tagLine = tagLine;
  profile.created_date = created_date;
  profile.last_updated = last_updated;
  profile.lastSeen = lastSeen;
  profile.email = email;
  profile.birthday = birthday;
  profile.webUrl = webUrl;
  profile.country = country;
  profile.address = address;
  profile.school = school;
  profile.liveLocation = liveLocation;
  profile.phone = phone;
  profile.lang = lang;
  profile.companyName = companyName;
  profile.voteCount = voteCount;
  profile.shareCount = shareCount;
  profile.followCount = followCount;
  profile.followerCount = followerCount;
  profile.postCount = postCount;
  profile.facebookId = facebookId;
  profile.instagramId = instagramId;
  profile.twitterId = twitterId;
  profile.linkedInId = linkedInId;
  profile.accessUserList = accessUserList;
  profile.permission = permission;

  const updatedProfile = await profileService.updateProfile(profile);

  if (!updatedProfile) {
    log.Error("updateProfile: Update Profile Problem");
    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        new utils.ErrorHandler(
          "profile.missingUpdateProfile",
          "Missing Update Profile"
        ).json()
      );
  }
  res.send(updatedProfile);
};
