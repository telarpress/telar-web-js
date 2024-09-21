const userSettingService = require("../services/userSettingService");
const utils = require("../../../core/utils/error-handler");
const { HttpStatusCode } = require("../../../core/utils/HttpStatusCode");

const log = require("../../../core/utils/errorLogger");

// CreateSettingGroupHandle handle create a new userSetting
exports.createSettingGroupHandle = async function (req, res) {
  try {
    const { list } = req.body;
    let userSettingList = [];
    list.forEach((settings) => {
      settings.list.forEach((setting) => {
        let newUserSetting = {
          ownerUserId: res.locals.user.userId,
          name: setting.name,
          value: setting.value,
          type: settings.type,
          isSystem: false,
        };
        userSettingList.push(newUserSetting);
      });
    });

    await userSettingService.saveManyUserSetting(userSettingList);

    return res.status(HttpStatusCode.OK).end();
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
  try {
    const { type, creationDate, ownerUserId, list } = req.body;
    const currentUserId = res.locals.user.userId;

    if (currentUserId == null || ownerUserId != currentUserId) {
      log.Error("[UpdateUserSettingHandle] Can not get current user");
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
    let objId = "";
    settingList = list;
    settingList.forEach((setting) => {
      objId = setting.objectId;
      let createdDateValue;
      if (creationDate == 0) {
        //let uuid = MUUID.v1();
        createdDateValue = Math.floor(Date.now() / 1000);
      } else {
        createdDateValue = creationDate;
      }
      let newUserSetting = {
        objectId: setting.objectId,
        ownerUserId: ownerUserId,
        created_date: createdDateValue,
        name: setting.name,
        value: setting.value,
        type: type,
        isSystem: setting.isSystem,
        // objectId: uuid,
        // ownerUserId: MUUID.from(settingOwnerUserId),
      };
      userSetting = userSetting.concat(newUserSetting);
    });

    if (!userSetting.length > 0 || !objId || !ownerUserId) {
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
  let currentUserId;
  try {
    const userID = req.body.userId;
    currentUserId = res.locals.user.userId;
    if (currentUserId == null || userID != currentUserId) {
      log.Error("[DeleteUserAllSettingHandle] Can not get current user");
      return res
        .status(HttpStatusCode.Unauthorized)
        .send(
          new utils.ErrorHandler(
            "setting.invalidCurrentUser",
            "Can not get current user"
          ).json()
        );
    }

    await userSettingService.deleteUserSettingByOwnerUserId(userID);
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
  return res.status(HttpStatusCode.OK).send({ objectId: currentUserId });
};
exports.getAllUserSetting = async function (req, res) {
  try {
    const currentUserId = res.locals.user.userId;
    const userSetting = await userSettingService.getAllUserSetting(
      currentUserId
    );

    return await res.status(HttpStatusCode.OK).send(userSetting);
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
  const { userIds, type } = req.body;
  try {
    const foundUsersSetting = await userSettingService.findSettingByUserIds(
      userIds,
      type
    );
    let mappedSetting = {};
    await foundUsersSetting.forEach((setting) => {
      let key = `${setting.ownerUserId}:${setting.type}:${setting.name}`;
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

exports.getUserSetting = async function (req, res) {
  try {
    const userSetingId = req.params.key;
    if (!userSetingId) {
      log.Error("userSeting Id is required!");
      return res
        .status(HttpStatusCode.InternalServerError)
        .send(
          new utils.ErrorHandler(
            "userSeting.userSetingIdRequired",
            "userSeting id is required!"
          ).json()
        );
    }

    const userSetting = await userSettingService.getUserSettingById(
      userSetingId
    );

    return res.status(HttpStatusCode.OK).send(userSetting).end();
  } catch (error) {
    log.Error(`Get UserSetting By Id Error ${error}`);
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "userSeting.getByIdUserSetting",
          "Get UserSetting Error!"
        ).json()
      );
  }
};

exports.deleteUserSetting = async function (req, res) {
  try {
    const userSetingId = req.params.key;
    if (!userSetingId) {
      log.Error("userSeting Id is required!");
      return res
        .status(HttpStatusCode.InternalServerError)
        .send(
          new utils.ErrorHandler(
            "userSeting.userSetingIdRequired",
            "userSeting id is required!"
          ).json()
        );
    }

    const userSetting = await userSettingService.deleteUserSettingById(
      userSetingId
    );

    return res.status(HttpStatusCode.OK).send(userSetting).end();
  } catch (error) {
    log.Error(`Delete UserSetting By Id Error ${error}`);
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "userSeting.deleteByIdUserSetting",
          "delete UserSetting Error!"
        ).json()
      );
  }
};

// GetUserSettingsHandle handle query on userSetting
exports.getUserSettingsHandle = async function (req, res) {
  try {
    const currentUserId = res.locals.user.uid;
    if (!currentUserId || currentUserId == null) {
      log.Error("[GetUserSettingsHandle] Can not get current user");
      return res
        .status(HttpStatusCode.Unauthorized)
        .send(
          new utils.ErrorHandler(
            "userSetting.invalidCurrentUser",
            "Can not get current user"
          ).json()
        );
    }

    const userSettingList = userSettingService.getUserSettings(
      currentUserId,
      req.body.page,
      req.body.search,
      req.body.type
    );
    return res.send(userSettingList);
  } catch (error) {
    log.Error(
      `[GetUserSettingsHandle] Error happened while reading userSetting ${error}`
    );
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "userSetting.getUserSettings",
          "Error happened while reading userSetting!"
        ).json()
      );
  }
};

// CreateUserSettingsHandle handle query on userSetting
exports.createUserSettingsHandle = async function (req, res) {
  try {
    const currentUserId = res.locals.user.uid;
    if (!currentUserId || currentUserId == null) {
      log.Error("[CreateUserSettingsHandle] Can not get current user");
      return res
        .status(HttpStatusCode.Unauthorized)
        .send(
          new utils.ErrorHandler(
            "userSetting.invalidCurrentUser",
            "Can not get current user"
          ).json()
        );
    }

    const userSettingList = await userSettingService.createUserSettings(
      currentUserId,
      req.body.name,
      req.body.type,
      req.body.value
    );

    return res.send(userSettingList).end();
  } catch (error) {
    log.Error(
      `[CreateUserSettingsHandle] Error happened while reading userSetting ${error}`
    );
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "userSetting.createUserSettings",
          "Error happened while reading userSetting!"
        ).json()
      );
  }
};
