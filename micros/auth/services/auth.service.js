const bcrypt = require("bcrypt");
const { appConfig } = require("../config");
const axios = require("axios").default;
const { UserAuth } = require("../models/user");
const { v4: uuidv4 } = require("uuid");

//Token const
const UserToken = require("../models/UserToken");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const GateKeeper = require("../utils/hmac");
const { validate: uuidValidate } = require("uuid");
const { sendEmail } = require("../utils/sendEmail");
const { generateJWTToken } = require("../../../core/utils/token.util");
const { isTimeExpired } = require("../../../core/utils/time.util");
const { functionCall } = require("../utils/common");

const numberOfVerifyRequest = 3;
const expireTimeOffset = 3600;

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

exports.verifyRecaptchaV2 = async function (recaptchaResponse, secretKey) {
  console.log("verifyRecaptchaV2 ", secretKey, recaptchaResponse);
  try {
    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: secretKey,
          response: recaptchaResponse,
        },
      }
    );

    if (response.data.success) {
      // reCAPTCHA verification successful
      return true;
    } else {
      // reCAPTCHA verification failed
      return false;
    }
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error.message);
    throw new Error("Failed to verify reCAPTCHA");
  }
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

exports.createEmailVerificationToken = async function (input) {
  const verification_Address = `${appConfig.WEB_URL}/auth/signup/verify`;

  console.log("sendEmail");
  await sendEmail(
    input.fullName,
    input.emailTo,
    input.code,
    input.emailBody,
    input.emailSubject,
    verification_Address
  );

  console.log("sendEmail done!");
  if (!uuidValidate(input.userId)) {
    throw "Error happened in Create Email Verfication Token";
  }
  const verifyId = uuidv4();
  const verifyType = "emv";
  const newUserToken = new UserToken({
    objectId: verifyId,
    code: input.code,
    userId: input.userId,
    target: input.emailTo,
    targetType: verifyType,
    counter: 1,
    remoteIpAddress: input.remoteIpAddress,
    isVerified: false,
  });
  console.log("save the token");
  await newUserToken.save();
  console.log("save the token donw");

  const metaToken = {
    userId: input.userId,
    verifyId: verifyId,
    remoteIpAddress: input.remoteIpAddress,
    mode: "Registeration",
    verifyType: verifyType,
    fullname: input.fullName,
    email: input.emailTo,
    password: input.userPassword,
  };
  const privateKey = appConfig.KEY;
  console.log("generateJWTToken");
  return generateJWTToken(privateKey, metaToken, 1);
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
  return true;
};

exports.getUserProfileByID = async function (reqUserId) {
  let userHeaders = { uid: reqUserId };
  try {
    const url = `/profile/dto/id/${reqUserId}`;
    const model = {
      id: reqUserId,
    };
    const foundProfile = await functionCall("get", model, url, userHeaders);

    if (!foundProfile) {
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

      console.log(`microCall ${url} -  ${foundProfile.message}`);
      throw new Error("getUserProfileByID/microCall");
    }
    return foundProfile;
  } catch (error) {
    console.error(error);
    throw new Error(`Cannot send request to /setting/dto/ids - ${error}`);
  }
};

// readLanguageSettingAsync Read language setting async
exports.readLanguageSettingAsync = async function (objectId, userInfoInReq) {
  const settings = await getUsersLangSettings(objectId, userInfoInReq);
  return { settings: settings };
};

// getUsersLangSettings Get users language settings
async function getUsersLangSettings(objectId, userInfoInReq) {
  try {
    const url = "/setting/dto/ids";
    const model = {
      userIds: objectId,
      type: "lang",
    };
    const headers = await getHeadersFromUserInfoReq(userInfoInReq);
    return await functionCall("post", model, url, headers);
  } catch (error) {
    return `Cannot send request to /setting/dto/ids - ${error}`;
  }
}

// getHeadersFromUserInfoReq
async function getHeadersFromUserInfoReq(info) {
  let userHeaders = {};
  userHeaders["uid"] = info.userId;
  userHeaders["email"] = info.username;
  userHeaders["avatar"] = info.avatar;
  userHeaders["displayName"] = info.displayName;
  userHeaders["role"] = info.systemRole;
  return userHeaders;
}

// getSettingPath
exports.getSettingPath = async function (userId, settingType, settingKey) {
  return `${userId}:${settingType}:${settingKey}`;
};

// createDefaultLangSetting
exports.createDefaultLangSetting = async function (userInfoInReq) {
  const settingBytes = {
    uid: userInfoInReq.objectId,
    email: userInfoInReq.username,
    avatar: userInfoInReq.avatar,
    displayName: userInfoInReq.fullName,
    role: userInfoInReq.role,
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
  const headers = await getHeadersFromUserInfoReq(userInfoInReq);
  const setting = functionCall("post", settingBytes, settingURL, headers);

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
exports.findUserByAccessToken = async function (userId) {
  try {
    return UserAuth.findOne({ objectId: userId });
  } catch (error) {
    throw new Error(error);
  }
};
exports.checkAdmin = async function () {
  try {
    return await UserAuth.findOne({ role: "admin" });
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

exports.changeUserPasswordByUserId = async function (
  oldPassword,
  objectId,
  reqPassword
) {
  try {
    const salt = await bcrypt.genSalt(Number(appConfig.SALT));
    let findUser = await UserAuth.findOne({ objectId });
    if (!bcrypt.compareSync(oldPassword, findUser.password)) {
      throw new Error("Passwords Not Match");
    }
    const hashPassword = await bcrypt.hash(reqPassword, salt);
    findUser.password = hashPassword;
    findUser.save();
  } catch (error) {
    throw new Error(error);
  }
};

exports.changeUserPasswordByCode = async function (user, newPassword, code) {
  const token = await UserToken.findOne({ objectId: user.objectId });
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
  UserAuth.findOneAndUpdate(
    { objectId },
    { last_updated: Math.floor(Date.now() / 1000) }
  );
  return await UserToken.findOneAndUpdate(
    { objectId: objectId },
    { $inc: { counter: 1 }, last_updated: Math.floor(Date.now() / 1000) }
  );
};

exports.saveUser = async function (findUser) {
  return await UserAuth.insertMany(findUser);
};

exports.verifyUserByCode = async function (
  userId,
  verifyId,
  remoteIpAddress,
  code,
  target
) {
  try {
    const userVerification = await UserToken.findOne({ objectId: verifyId });

    if (!userVerification) {
      console.error("Invalid verifyId");
      throw new Error("verifyUserByCode/invalidVerifyId");
    }

    if (userVerification.remoteIpAddress !== remoteIpAddress) {
      throw new Error("verifyUserByCode/differentRemoteAddress");
    }

    const newCounter = userVerification.counter + 1;
    userVerification.counter = newCounter;

    if (newCounter > numberOfVerifyRequest) {
      throw new Error("verifyUserByCode/exceedRequestsLimits");
    }

    if (userVerification.isVerified) {
      throw new Error("verifyUserByCode/alreadyVerified");
    }

    if (userVerification.target !== target) {
      throw new Error(
        `verifyUserByCode/differentTarget ${userVerification.target} : ${target}`
      );
    }

    console.log(`Code: ${userVerification.code} , User code: ${code}`);

    const filter = { objectId: verifyId };
    if (userVerification.code !== code) {
      userVerification.last_updated = Date.now();

      const updateData = {
        last_updated: userVerification.last_updated,
        counter: userVerification.counter,
      };
      await UserToken.updateOne(filter, updateData);

      throw new Error("createCodeVerification/wrongPinCode");
    }

    if (isTimeExpired(userVerification.created_date, expireTimeOffset)) {
      throw new Error("verifyUserByCode/codeExpired");
    }

    const updateData = {
      last_updated: userVerification.last_updated,
      counter: userVerification.counter,
      isVerified: true,
    };

    await UserToken.updateOne(filter, updateData);

    return true;
  } catch (error) {
    console.error(`Error in verifyUserByCode: ${error.message}`);
    throw error;
  }
};
