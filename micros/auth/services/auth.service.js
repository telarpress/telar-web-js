const bcrypt = require("bcrypt");
const { appConfig } = require("../config");
const axios = require("axios").default;
const { UserAuth } = require("../models/user");

//Token const
const UserToken = require("../models/UserToken");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const GateKeeper = require("../utils/hmac");
const { validate: uuidValidate } = require("uuid");

exports.hashPassword = async function (plainTextPassword) {
  const salt = await bcrypt.genSalt(Number(appConfig.SALT));
  const hashPassword = bcrypt.hash(plainTextPassword, salt);
  return hashPassword;
};
exports.findByUsername = async function (reqEmail) {
  try {
    return await UserAuth.findOne({ username: reqEmail });
  } catch (error) {
    throw `loginHandler : ${error}`;
  }
};

exports.checkUserExistById = async function (objectId, userId) {
  return await UserAuth.findOne({
    objectId: objectId,
    username: userId,
  });
};

exports.recaptchaV3 = async function (response_key) {
  // Put secret key here, which we get from google console
  const secret_key = appConfig.RECAPTCHA_SECRET_KEY;
  // Hitting POST request to the URL, Google will
  // respond with success or error scenario.
  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${response_key}`;

  try {
    let result = await axios({
      method: "post",
      url: url,
    });
    let data = result.data || {};

    if (!data.success) {
      return { success: false };
    }
    return { success: true };
  } catch (err) {
    throw err.response ? err.response.data : `Error while recaptcha : ${err}`;
  }
};

exports.createUser = async function (reqUserId, reqEmail, hashPassword) {
  return await new UserAuth({
    objectId: reqUserId,
    username: reqEmail,
    password: hashPassword,
  }).save();
};

exports.CreateEmailVerficationToken = async function (userVerification) {
  if (!uuidValidate(userVerification.UserId)) {
    throw "Error happened in Create Email Verfication Token";
  }
  return await new UserToken({
    objectId: userVerification.UserId,
    code: crypto.randomBytes(32).toString("hex").substring(0, 6),
    userId: userVerification.Username,
    target: userVerification.EmailTo,
    targetType: "email",
    remoteIpAddress: userVerification.RemoteIpAddress,
    isVerified: false,
  }).save();
};

exports.callAPIWithHMAC = async (method, url, json, userInfo) => {
  const hashData = GateKeeper.sign(JSON.stringify(json), appConfig.HMAC_KEY);

  console.log(
    "[INFO][HTTP CALL] callAPIWithHMAC: ",
    "Method: " + method,
    "URL: " + url,
    "Payload: " + JSON.stringify(json),
    "User Info: " + userInfo
  );
  let axiosConfig = {
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      "user-agent": "authToProfiles",
    },
  };
  axiosConfig.headers[appConfig.HMAC_NAME] = `${hashData.toString()}`;
  const getProfile = await axios.post(
    "http://localhost/profile/dto/",
    json,
    axiosConfig
  );

  if (!getProfile) {
    console.log(`callAPIWithHMAC ${getProfile}`);
    return Error("auth/callAPIWithHMAC");
  }
  console.info(getProfile);
  return true;
};

exports.getUserProfileByID = async function (reqUserId) {
  const profileURL = `/profile/${reqUserId}`;
  let axiosConfig = {
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      "user-agent": "authToProfile",
    },
  };

  const foundProfile = await axios.get(profileURL, axiosConfig);

  if (!foundProfile) {
    //TODO: Expansion of errors
    if (appConfig.Node_ENV === "development") {
      if (foundProfile.response) {
        // The client was given an error response (5xx, 4xx)
        console.log(foundProfile.response.data);
        console.log(foundProfile.response.status);
        console.log(foundProfile.response.headers);
      } else if (foundProfile.request) {
        // The client never received a response, and the request was never left
        console.log(foundProfile.request);
      } else {
        // Anything else
        console.log("Error", foundProfile.message);
      }
    }
    if (foundProfile.response.status == 404)
      console.log("NotFoundHTTPStatusError: " + foundProfile);

    console.log(`microCall ${profileURL} -  ${foundProfile.message}`);
    return Error("getUserProfileByID/microCall");
  }

  console.log(foundProfile);
};

// readLanguageSettingAsync Read language setting async
exports.readLanguageSettingAsync = async function (objectId, userInfoInReq) {
  foundUser.objectId,
    (userInfoInReq = {
      UserId: foundUser.objectId,
      Username: foundUser.username,
      systemRole: foundUser.role,
    });

  const settings = getUsersLangSettings(objectId, userInfoInReq);
  return await { settings: settings };
};

// getUsersLangSettings Get users language settings
async function getUsersLangSettings(objectId, userInfoInReq) {
  const url = "/setting/dto/ids";
  const model = {
    userIds: objectId,
    type: "lang",
  };

  try {
    return await microCall(
      post,
      model,
      url,
      getHeadersFromUserInfoReq(userInfoInReq)
    );
  } catch (error) {
    return `Cannot send request to ${url} - ${error}`;
  }
}

// microCall send request to another function/microservice using cookie validation
/**
 *
 * @param {'get' | 'GET'
  | 'delete' | 'DELETE'
  | 'head' | 'HEAD'
  | 'options' | 'OPTIONS'
  | 'post' | 'POST'
  | 'put' | 'PUT'
  | 'patch' | 'PATCH'
  | 'purge' | 'PURGE'
  | 'link' | 'LINK'
  | 'unlink' | 'UNLINK'} method
 * @param {*} data
 * @param {string} url
 * @param {*} headers
 */
const microCall = async (method, data, url, headers = {}) => {
  try {
    const digest = GateKeeper.sign(JSON.stringify(data), process.env.HMAC_KEY);
    headers["Content-type"] = "application/json";
    headers[appConfig.HMAC_NAME] = "sha1=" + digest;

    console.log(`\ndigest: sha1=${digest}, header: ${appConfig.HMAC_NAME} \n`);

    const result = await axios({
      method: method,
      data,
      url: appConfig.InternalGateway + url,
      headers,
    });

    return result.data;
  } catch (error) {
    // handle axios error and throw correct error
    // https://github.com/axios/axios#handling-errors
    console.log(
      `Error while sending admin check request!: callAPIWithHMAC ${httpReq}`
    );
    return Error(
      "Error while sending admin check request!: actionRoom/callAPIWithHMAC"
    );
  }
};

// getHeadersFromUserInfoReq
async function getHeadersFromUserInfoReq(info) {
  let userHeaders = [];
  userHeaders["uid"] = info.userId.String();
  userHeaders["email"] = info.username;
  userHeaders["avatar"] = info.avatar;
  userHeaders["displayName"] = info.displayName;
  userHeaders["role"] = info.systemRole;
  return await userHeaders;
}

// getSettingPath
exports.getSettingPath = async function (userId, settingType, settingKey) {
  return await userId, settingType, settingKey;
};

// createDefaultLangSetting
exports.createDefaultLangSetting = async function (userInfoInReq) {
  const settingBytes = {
    list: [
      {
        type: "lang",
        list: [
          {
            name: "current",
            value: "en",
          },
        ],
      },
    ],
  };

  // Send request for setting
  const settingURL = "/setting";
  const setting = microCall(
    post,
    settingBytes,
    settingURL,
    getHeadersFromUserInfoReq(userInfoInReq)
  );

  if (!setting) {
    return false;
  }
  return setting;
};

exports.checkTokenExist = async function (reqCode) {
  return await UserToken.findOne({ code: reqCode });
};
exports.checkTokenExistByUserId = async function (robjectId, rcode) {
  return await UserToken.findOne({ objectId: robjectId, code: rcode });
};
exports.countExistToken = async function (reqCode) {
  return await UserToken.findOne({ code: reqCode });
};

exports.updateVerifyUser = async function (reqUserId, verified) {
  const findUserToken = await UserToken.updateOne(
    { objectId: reqUserId },
    { isVerified: verified }
  );
  if (!findUserToken) console.log("updateOne Error: " + findUserToken);

  console.log("updateOne Updated - " + findUserToken);

  //TODO: PhoneVerfy
  return await UserAuth.updateOne(
    { objectId: reqUserId },
    { emailVerified: verified }
  );
};

exports.updateTokenCounter = async function (tokenId) {
  const findUserToken = await UserToken.findOne({ objectId: tokenId });
  if (findUserToken) console.log("updateTokenCounter Error: " + findUserToken);
  let count = findUserToken.counter + 1;
  return UserToken.updateOne({ objectId: tokenId }, { counter: count });
};

// exports.checkUserVerify = async function (reqUserName) {
//   if (
//     await UserAuth.findOne(
//       { username: reqUserName },
//       { emailVerified: true } || { phoneVerified: true }
//     )
//   )
//     return true;
//   else return false;
// };

exports.CompareHash = async function (reqPassword, userPassword) {
  return await bcrypt.compare(reqPassword, userPassword);
};

exports.checkVerifyToken = async function (token) {
  return await jwt.verify(token, appConfig.ACCESS_TPK);
};
exports.findUserByAccessToken = async function (token) {
  try {
    const decode = jwt.verify(token, appConfig.ACCESS_TPK);
    return UserAuth.findOne({ objectId: decode.id });
  } catch (error) {
    throw new Error(error);
  }
};

exports.changeUserPasswordByAccessToken = async function (
  oldPassword,
  token,
  reqPassword
) {
  try {
    const decode = await jwt.verify(token, appConfig.ACCESS_TPK);
    const salt = await bcrypt.genSalt(Number(appConfig.SALT));
    let findUser = await UserAuth.findOne({ objectId: decode.id });
    if (!bcrypt.compareSync(oldPassword, findUser.password)) {
      throw new Error();
    }
    const hashPassword = await bcrypt.hash(reqPassword, salt);
    findUser.password = hashPassword;
    findUser.save();
  } catch (error) {
    throw new Error(error);
  }
};

exports.changeUserPasswordByCode = async function (user, newPassword, code) {
  console.log(user);
  const token = await UserToken.findOne({ objectId: user.objectId });
  console.log(token);
  console.log(code);
  if (token.code != code) {
    throw new Error();
  }

  const salt = await bcrypt.genSalt(Number(appConfig.SALT));
  const hashPassword = await bcrypt.hash(newPassword, salt);
  user.password = hashPassword;
  user.save();
};

exports.emptyTokenCode = async function (objectId) {
  return await UserToken.findOneAndUpdate({ objectId: objectId }, { code: "" });
};

exports.getTokenByUserId = async function (objectId) {
  return await UserToken.findOne({ objectId: objectId });
};

exports.createToken = async function (objectId) {
  await UserToken.findOneAndUpdate(
    { objectId: objectId },
    { code: crypto.randomBytes(32).toString("hex").substring(0, 6) }
  );
  return await UserToken.findOne({ objectId: objectId });
  // return await new UserToken({
  //   objectId: reqUserId,
  //   code: crypto.randomBytes(32).toString("hex"),
  // }).save();
};

exports.checkCode = async function (objectId) {
  return await UserToken.findOne({ objectId: objectId });
};

exports.findUserById = async function (userId) {
  return await UserAuth.findOne({ objectId: userId });
};
exports.getUsers = async function () {
  return await UserAuth.find();
};
exports.getTokens = async function () {
  return await UserToken.find();
};

// add Counter And Last Update
exports.addCounterAndLastUpdate = async (objectId) => {
  UserAuth.findOneAndUpdate({ objectId }, { last_updated: Date.now() });
  return await UserToken.findOneAndUpdate(
    { objectId: objectId },
    { $inc: { counter: 1 }, last_updated: Date.now() }
  );
};

exports.saveUser = function (findUser) {
  findUser.save();
};
