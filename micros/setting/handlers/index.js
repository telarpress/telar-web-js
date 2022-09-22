const userSettingService = require("../services/userSettingService");
const utils = require("../utils/error-handler");
const { HttpStatusCode } = require("../utils/HttpStatusCode");
// const hmac = require("../utils/hmac");
// const { appConfig } = require("../config");
const log = require("../utils/errorLogger");
// const { validate: uuidValidate } = require("uuid");
// const { default: axios } = require("axios");

// CreateSettingGroupHandle handle create a new userSetting
exports.createSettingGroupHandle = async function (req, res) {
  const token = req.cookies.token;
  if (!token) {
    log.Error("[CreateUserSettingHandle] Can not get current user");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "setting.invalidCurrentUser",
          "Can not get current user"
        ).json()
      );
  }

  try {
    const { type, creationDate, ownerUserId, list } = req.body;
    const currentUserId = await userSettingService.findProfileByAccessToken(
      token
    );
    if (currentUserId == null || ownerUserId != currentUserId)
      res.status(HttpStatusCode.NotFound).end();

    await userSettingService.saveManyUserSetting(
      type,
      creationDate,
      ownerUserId,
      list
    );

    return await res
      .status(HttpStatusCode.OK)
      .send({ objectId: currentUserId })
      .json();
  } catch (error) {
    log.Error("Save UserSetting Error " + error);
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "setting.saveUserSetting",
          "Error happened while saving UserSetting!"
        ).json()
      );
  }
};

// UpdateUserSettingHandle handle create a new userSetting
exports.updateUserSettingHandle = async function (req, res) {
  const token = req.cookies.token;
  if (!token) {
    log.Error("[CreateUserSettingHandle] Can not get current user");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "setting.invalidCurrentUser",
          "Can not get current user"
        ).json()
      );
  }

  try {
    const { type, creationDate, ownerUserId, list } = req.body;
    const currentUserId = await userSettingService.findProfileByAccessToken(
      token
    );

    if (currentUserId == null || ownerUserId != currentUserId) {
      log.Error("[CreateUserSettingHandle] Can not get current user");
      return res
        .status(HttpStatusCode.Unauthorized)
        .send(
          new utils.ErrorHandler(
            "setting.invalidCurrentUser",
            "Can not get current user"
          ).json()
        );
    }
    let userSetting = [];
    let settingList = [];
    settingList = list;
    settingList.forEach((setting) => {
      let createdDateValue;
      if (creationDate == 0) {
        //let uuid = MUUID.v1();
        createdDateValue = Math.floor(Date.now() / 1000);
      } else {
        createdDateValue = creationDate;
      }
      let newUserSetting = new Object({
        objectId: setting.objectId,
        ownerUserId: ownerUserId,
        createdDate: createdDateValue,
        name: setting.name,
        value: setting.value,
        type: type,
        isSystem: setting.isSystem,
        // objectId: uuid,
        // ownerUserId: MUUID.from(settingOwnerUserId),
      });
      userSetting = userSetting.concat(newUserSetting);
    });
    if (!userSetting.length > 0) {
      log.Error("No setting added for update Error ");
      return res
        .status(HttpStatusCode.InternalServerError)
        .send(
          new utils.ErrorHandler(
            "setting.noSettingForUpdateg",
            "Can not find setting for update!"
          ).json()
        );
    }

    await userSettingService.updateUserSettingsById(userSetting);

    return await res
      .status(HttpStatusCode.OK)
      .send({ objectId: currentUserId })
      .json();
  } catch (error) {
    log.Error("Update UserSetting Error " + error);
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "setting.updateUserSetting",
          "Can not update user setting!"
        ).json()
      );
  }
};

// DeleteUserAllSettingHandle handle delete all userSetting
exports.deleteUserAllSettingHandle = async function (req, res) {
  const token = req.cookies.token;
  if (!token) {
    log.Error("[CreateUserSettingHandle] Can not get current user");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "setting.invalidCurrentUser",
          "Can not get current user"
        ).json()
      );
  }

  try {
    const userID = req.body;
    const currentUserId = await userSettingService.findProfileByAccessToken(
      token
    );

    if (currentUserId == null || userID != currentUserId)
      res.status(HttpStatusCode.NotFound).end();

    await userSettingService.deleteUserSettingByOwnerUserId(currentUserId);
  } catch (error) {
    log.Error("Delete UserSetting Error " + error);
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "setting.deleteUserSetting",
          "Error happened while removing UserSetting!"
        ).json()
      );
  }
  return res.status(HttpStatusCode.OK).send({ objectId: currentUserId }).json();
};
exports.getAllUserSetting = async function (req, res) {
  const token = req.cookies.token;
  if (!token) {
    log.Error("[GetAllUserSetting] Can not get current user");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "setting.invalidCurrentUser",
          "Can not get current user"
        ).json()
      );
  }
  try {
    const currentUserId = await userSettingService.findProfileByAccessToken(
      token
    );
    const { userID } = req.body;
    if (currentUserId == null || userID != currentUserId)
      res.status(HttpStatusCode.NotFound).end();
    const userSetting = await userSettingService.getAllUserSetting(
      currentUserId
    );
    return await res.status(HttpStatusCode.OK).send(userSetting).json().end();
  } catch (error) {
    if (error == "TokenExpiredError: jwt expired")
      return res.redirect("/auth/login");
    log.Error("[GetAllUserSetting] " + error);
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "setting.getAllUserSetting",
          "Can not get user settings!"
        ).json()
      );
  }
};
// GetSettingByUserIds a function invocation to setting by user ids
exports.getSettingByUserIds = async function (req, res) {
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

  const { userIds, type } = req.body;

  try {
    const foundUsersSetting = await userSettingService.findSettingByUserIds(
      userIds,
      type,
      token
    );
    let mappedSetting = {};
    await foundUsersSetting.forEach((setting) => {
      let key = `${setting.ownerUserId}:${setting.type}:${setting.name}`;
      console.log(key);
      mappedSetting[key] = setting.value;
    });
    return await res.status(HttpStatusCode.OK).send(mappedSetting).json();
  } catch (error) {
    log.Error("[userSettingService.FindSettingByUserIds] " + error);
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "userSettingService.findUserSetting",
          "Can not find users settings by ids!"
        ).json()
      );
  }
};
