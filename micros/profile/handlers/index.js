// const { ajv } = require("../validation");
// const validate_getID = ajv.getSchema("getID");
// const validate_setData = ajv.getSchema("setData");
const hmac = require("../utils/hmac");
const { appConfig } = require("../config");
const log = require("../../../core/utils/errorLogger");
const utils = require("../../../core/utils/error-handler");
const { HttpStatusCode } = require("../../../core/utils/HttpStatusCode");
const profileService = require("../services/profile.service");
const { validate: uuidValidate } = require("uuid");
const { default: axios } = require("axios");
// ReadMyProfileHandle a function invocation to read authed user profile
exports.readMyProfileHandle = async function (req, res) {
  try {
    const objectId = res.locals.user.uid;
    const findProfile = await profileService.getProfileById(objectId);
    return res.status(HttpStatusCode.OK).send(findProfile);
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

// GetBySocialName get user profile by social name
exports.getBySocialName = async function (req, res) {
  if (!req.params.name) {
    log.Error("GetBySocialName: Social name is required!");
    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        new utils.ErrorHandler(
          "profile.missingGetBySocialName",
          "Missing GetBy Social Name"
        ).json()
      );
  }
  try {
    const foundUser = await profileService.findBySocialName(req.params.name);

    if (!foundUser) {
      log.Error("[GetBySocialName] Could not find user " + req.params.name);
      return res
        .status(HttpStatusCode.NotFound)
        .send(
          new utils.ErrorHandler(
            "profile.missingGetBySocialName",
            "Missing Find Profile, Error happened while finding user profile!"
          ).json()
        );
    }
    return res.status(HttpStatusCode.OK).send(foundUser);
  } catch (error) {
    log.Error(`findBySocialName ${error}`);

    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "profile.missingGetBySocialName",
          "Missing Find Profile, Error happened while finding user profile!"
        ).json()
      );
  }
};

// ReadDtoProfileHandle a function invocation
exports.readDtoProfileHandle = async function (req, res) {
  try {
    const userId = req.params.userId;
    // if (!uuidValidate(UserId)) {
    //   log.Error("ReadDtoProfileHandle: Parse UUID Problem");
    //   return res
    //     .status(HttpStatusCode.Unauthorized)
    //     .send(
    //       new utils.ErrorHandler(
    //         "profile.missingReadDtoProfileHandle",
    //         "parseUUIDError, Can not parse user id!"
    //       ).json()
    //     );
    // }
    const findProfile = await profileService.getProfileById(userId);
    return res.status(HttpStatusCode.OK).send(findProfile).json();
  } catch (error) {
    log.Error(`[ReadDtoProfileHandle] Could not find user ${error}`);
    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        new utils.ErrorHandler(
          "profile.notFoundUser",
          "Error happened while finding user profile!"
        ).json()
      );
  }
};

// UpdateLastSeen a function invocation
exports.updateLastSeen = async function (req, res) {
  try {
    {
      const userId = req.body.userId;
      await profileService.updateLastSeenNow(userId);
      return res.status(HttpStatusCode.OK).end();
    }
  } catch (error) {
    log.Error(`UpdateLastSeen: Update Profile Problem ${error}`);
    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        new utils.ErrorHandler(
          "profile.missingUpdateLastSeen",
          "Missing Update Profile, Error happened while updating last seen"
        ).json()
      );
  }
};

// Get user profile
exports.readProfileHandle = async function (req, res) {
  if (!req.params.userId) {
    log.Error("ReadProfileHandle: Get Profile Problem");
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
    const findProfile = await profileService.getProfileById(req.params.userId);
    return res.status(HttpStatusCode.OK).send(findProfile);
  } catch (error) {
    log.Error(`readProfileHandle: Get Profile Problem ${error}`);
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

// GET Profile
exports.queryUserProfileHandle = async function (req, res) {
  if (!res.locals.user.uid) {
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
    const findProfile = await profileService.getProfileById(
      res.locals.user.uid
    );
    return res.status(HttpStatusCode.OK).send(findProfile);
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
exports.createDtoProfileHandle = async (req, res) => {
  if (req.body) {
    // if (validate_setData(req.body)) {
    profileService.createDtoProfileHandle(req.body);
    res.send("User has been added to Profile microservice service");
  } else {
    log.Error(
      `createDtoProfileHandle: Create profile error `
      // ${JSON
      //   .stringify
      //   // validate_setData.errors
      //   ()}
    );
    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        new utils.ErrorHandler(
          "profile.missingcreateDtoProfileHandle",
          "Error happened while saving user profile!"
        ).json()
      );
  }
};
// IncreaseFollowCount a function invocation
exports.increaseFollowCount = async function (req, res) {
  // params from /follow/inc/:inc/:userId
  const userId = req.params.userId;

  if (userId == "") {
    log.Error("IncreaseFollowCount : User Id is required!");
    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        new utils.ErrorHandler(
          "profile.missingUserId",
          "Error happened while Increase Follow Count!"
        ).json()
      );
  }

  if (!uuidValidate(userId)) {
    log.Error("IncreaseFollowCount: Parse UUID Problem");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "profile.missingIncreaseFollowCount",
          "parseUUIDError, Can not parse user id!"
        ).json()
      );
  }

  const incParam = req.params.inc;

  if (!incParam) {
    log.Error(`IncreaseFollowCount: Wrong inc param ${incParam}`);
    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        new utils.ErrorHandler(
          "profile.missingIncreaseFollowCount",
          "invalidIncParam, Wrong inc param!"
        ).json()
      );
  }

  try {
    await profileService.increaseFollowCount(userId, incParam);
  } catch (error) {
    log.Error(`IncreaseFollowCount: Update follow count ${error}`);
    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        new utils.ErrorHandler(
          "profile.missingIncreaseFollowCount",
          "missingUpdateFollowCount, Error happened while updating follow count!"
        ).json()
      );
  }

  return res.status(HttpStatusCode.OK).end();
};

// IncreaseFollowerCount a function invocation
exports.increaseFollowerCount = async function (req, res) {
  // params from /follower/inc/:inc/:userId
  const userId = req.params.userId;

  if (userId == "") {
    log.Error("increaseFollowerCount : User Id is required!");
    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        new utils.ErrorHandler(
          "profile.missingUserId",
          "Error happened while Increase Follower Count!"
        ).json()
      );
  }

  if (!uuidValidate(userId)) {
    log.Error("increaseFollowerCount: Parse UUID Problem");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "profile.missingincreaseFollowerCount",
          "parseUUIDError, Can not parse user id!"
        ).json()
      );
  }

  const incParam = req.params.inc;

  if (!incParam) {
    log.Error(`increaseFollowerCount: Wrong inc param ${incParam}`);
    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        new utils.ErrorHandler(
          "profile.missingincreaseFollowerCount",
          "invalidIncParam, Wrong inc param!"
        ).json()
      );
  }

  try {
    await profileService.increaseFollowerCount(userId, incParam);
  } catch (error) {
    log.Error(`increaseFollowerCount: Update follower count ${error}`);
    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        new utils.ErrorHandler(
          "profile.missingincreaseFollowerCount",
          "missingUpdateFollowerCount, Error happened while updating follower count!"
        ).json()
      );
  }

  return res.status(HttpStatusCode.OK).end();
};

// GetProfileByIds a function invocation to profiles by ids
exports.getProfileByIds = async function (req, res) {
  try {
    const foundUsers = await profileService.findProfileByUserIds(
      req.body.userIds
    );
    return res.status(HttpStatusCode.OK).send(foundUsers);
  } catch (error) {
    log.Error("[DispatchProfilesHandle] FindProfileByUserIds " + error);
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "profile.missingFindProfileByUserIds",
          "Error happened while finding users profile!"
        ).json()
      );
  }
};

// DispatchProfilesHandle a function invocation to read authed user profile
exports.dispatchProfilesHandle = async function (req, res) {
  try {
    const foundUsers = await profileService.findProfileByUserIds(
      req.body.userIds
    );
    let mappedUsers = {};
    for (let index = 0; index < foundUsers.length; index++) {
      let mappedUser = {};
      mappedUser["userId"] = foundUsers[index]["objectId"];
      mappedUser["fullName"] = foundUsers[index]["fullName"];
      mappedUser["socialName"] = foundUsers[index]["socialName"];
      mappedUser["avatar"] = foundUsers[index]["avatar"];
      mappedUser["banner"] = foundUsers[index]["banner"];
      mappedUser["tagLine"] = foundUsers[index]["tagLine"];
      mappedUser["lastSeen"] = foundUsers[index]["lastSeen"];
      mappedUser["created_date"] = foundUsers[index]["created_date"];

      mappedUser["lastUpdated"] = foundUsers[index]["last_updated"];
      mappedUser["email"] = foundUsers[index]["email"];
      mappedUser["lang"] = foundUsers[index]["lang"];
      mappedUser["permission"] = foundUsers[index]["permission"];
      mappedUsers[foundUsers[index]["objectId"]] = mappedUser;
    }

    const actionRoomPayload = {
      users: { mappedUsers },
    };
    const activeRoomAction = {
      type: "SET_USER_ENTITIES",
      payload: { actionRoomPayload },
    };

    const currentUser = await profileService.getProfileById(
      res.locals.user.uid
    );

    if (!(currentUser.objectId === req.body.objectId)) {
      log.Error("[DispatchProfilesHandle] Can not get current user");
      return res
        .status(HttpStatusCode.BadRequest)
        .send(
          new utils.ErrorHandler(
            "profile.missingDispatchProfilesHandle",
            "Can not get current user"
          ).json()
        );
    }
    const userInfoReq = {
      userId: currentUser.objectId,
      username: currentUser.email,
      avatar: currentUser.avatar,
      displayName: currentUser.socialName,
      systemRole: currentUser.permission[0],
    };

    const resData = await dispatchAction(activeRoomAction, userInfoReq);

    return res.status(HttpStatusCode.OK).send(resData);
  } catch (error) {
    log.Error("[DispatchProfilesHandle] FindProfileByUserIds " + error);
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "profile.missingFindProfileByUserIds",
          "Error happened while finding users profile!"
        ).json()
      );
  }
};

// Dispatch action
async function dispatchAction(action, userInfoInReq) {
  const actionURL = `/actions/dispatch/${userInfoInReq.userId}`;

  try {
    const actionBytes = action.payload.actionRoomPayload.users.mappedUsers;
    // Create user headers for http request
    const config = {
      headers: {
        uid: userInfoInReq.userId,
        email: userInfoInReq.username,
        avatar: userInfoInReq.avatar,
        displayName: userInfoInReq.displayName,
        role: userInfoInReq.systemRole,
      },
      timeout: 1000,
    };
    const response = await axios.post(actionURL, actionBytes, config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error))
      log.Error("Cannot send action request! error" + error);
  }
}

// InitProfileIndexHandle handle create a new index
exports.initProfileIndexHandle = async function (req, res) {
  let postIndexMap = {};
  postIndexMap["fullName"] = "text";
  postIndexMap["objectId"] = 1;
  postIndexMap["socialName"] = "text";
  try {
    await profileService.createUserProfileIndex(postIndexMap);
  } catch (error) {
    log.Error("initProfileIndexHandle: Create post index Error " + error);
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "profile.missingCreatePostIndex",
          "Error happened while creating post index!"
        ).json()
      );
  }
  return res.status(HttpStatusCode.OK);
};

// PUT update /profile
exports.updateProfile = async function (req, res) {
  try {
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
    const profile = await profileService.getProfileById(res.locals.user.uid);

    if (!(profile.objectId === objectId)) {
      log.Error("updateProfile: Update Profile objectId Problem");
      return res
        .status(HttpStatusCode.BadRequest)
        .send(
          new utils.ErrorHandler(
            "profile.missingUpdateProfile",
            "Missing Update Profile"
          ).json()
        );
    }
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
  } catch (error) {
    log.Error("updateProfile: Update Profile Problem" + error);
    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        new utils.ErrorHandler(
          "profile.missingUpdateProfile",
          "Missing Update Profile"
        ).json()
      );
  }
};

// Increase share count
exports.increaseShareCount = () => {
  return " Not implemented!";
};

// Decrease share count
exports.decreaseShareCount = () => {
  return " Not implemented!";
};

// Initialize user status
exports.initUserStatus = () => {
  return " Not implemented!";
};

// Decrease follow count
exports.decreaseFollowCount = () => {
  return " Not implemented!";
};
