const actionRoomService = require("../services/action-room.service");
const utils = require("../utils/error-handler");
const { HttpStatusCode } = require("../utils/HttpStatusCode");
// const hmac = require("../utils/hmac");
// const { appConfig } = require("../config");
const log = require("../utils/errorLogger");
const { appConfig } = require("../config");
// const { validate: uuidValidate } = require("uuid");
// const { default: axios } = require("axios");

// CreateActionRoomHandle handle create a new actionRoom
exports.createActionRoomHandle = async function (req, res) {
  const token = req.cookies.token;
  if (!token) {
    log.Error("[CreateActionRoomHandle] Can not get current user");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "actionRoom.invalidCurrentUser",
          "Can not get current user"
        ).json()
      );
  }
  const currentUserId = await actionRoomService.findIdByAccessToken(token);
  if (currentUserId == null || ownerUserId != currentUserId) {
    log.Error("[CreateActionRoomHandle] Can not get current user");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "actionRoom.invalidCurrentUser",
          "Can not get current user"
        ).json()
      );
  }
  try {
    const model = req.body;
    if (model == null) {
      log.Error("[CreateActionRoomHandle] Parse CreateActionRoomModel Error");
      return res
        .status(HttpStatusCode.BadRequest)
        .send(
          new utils.ErrorHandler(
            "actionRoom.parseCreateActionRoomModel",
            "Parse CreateActionRoomModel Error"
          ).json()
        );
    }

    let newActionRoom = new Object({
      objectId: model.objectId,
      ownerUserId: currentUserId,
      privateKey: model.privateKey,
      accessKey: model.accessKey,
      status: model.status,
      createdDate: model.createdDate,
    });

    const createActionRoom = await actionRoomService.saveActionRoom(
      newActionRoom
    );
    return res.status(HttpStatusCode.OK).send(createActionRoom).json();
  } catch (error) {
    log.Error("Save ActionRoom Error " + error);
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "actionRoom.saveActionRoom",
          "Save ActionRoom Error!"
        ).json()
      );
  }
};

// DispatchHandle handle create a new actionRoom
exports.dispatchHandle = async function () {
  // params from /actions/dispatch/:roomId
  const actionRoomId = req.Params.roomId;
  if (actionRoomId == "") {
    log.Error("ActionRoom Id is required!");
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "actionRoom.actionRoomIdRequired",
          "ActionRoom Id is required!"
        ).json()
      );
  }
  const bodyReader = bytes.NewBuffer(req.body);
  const URL = `${appConfig.WEBSOCKET_SERVER_URL}/api/dispatch/${actionRoomId}`;
  log.Info(` Dispatch URL: ${URL}`);
  try {
    let axiosConfig = {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "user-agent": "anyToActionRoom",
      },
    };
    const xCloudSignature = appConfig.HEADER_HMAC_AUTHENTICATE;
    axiosConfig.headers[appConfig.HMAC_HEADER_NAME] = xCloudSignature;
    axiosConfig.headers["ORIGIN"] = appConfig.GATEWAY;
    const httpReq = axios.post(URL, bodyReader, axiosConfig);

    if (!httpReq) {
      console.log(`callAPIWithHMAC ${httpReq}`);
      return Error("actionRoom/callAPIWithHMAC");
    }
    console.info(httpReq);
    return await res.status(HttpStatusCode.OK);
  } catch (error) {
    log.Error("Error while creating dispatch request!" + error);
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "actionRoom.createDispatchRequest",
          "Error while creating dispatch request!"
        ).json()
      );
  }
};

// UpdateActionRoomHandle handle create a new actionRoom
exports.updateActionRoomHandle = async function (req, res) {
  const token = req.cookies.token;
  if (!token) {
    log.Error("[UpdateActionRoomHandle] Can not get current user");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "actionRoom.invalidCurrentUser",
          "Can not get current user"
        ).json()
      );
  }

  const currentUserId = await actionRoomService.findIdByAccessToken(token);
  if (currentUserId == null || ownerUserId != currentUserId) {
    log.Error("[UpdateActionRoomHandle] Can not get current user");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "actionRoom.invalidCurrentUser",
          "Can not get current user"
        ).json()
      );
  }

  try {
    const model = req.body;
    if (model == null) {
      log.Error("[UpdateActionRoomHandle] Parse ActionRoomModel Error");
      return res
        .status(HttpStatusCode.BadRequest)
        .send(
          new utils.ErrorHandler(
            "actionRoom.parseActionRoomModel",
            "Error happened while parsing model!"
          ).json()
        );
    }

    let updatedActionRoom = new Object({
      objectId: model.objectId,
      ownerUserId: currentUserId,
      privateKey: model.privateKey,
      accessKey: model.accessKey,
      status: model.status,
      createdDate: model.createdDate,
    });

    const updatedActionRoomReult = await actionRoomService.updateActionRoomById(
      updatedActionRoom
    );
    return res.status(HttpStatusCode.OK).send(updatedActionRoomReult).json();
  } catch (error) {
    log.Error("Update ActionRoom Error " + error);
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "actionRoom.updateActionRoom",
          "Can not update action room!"
        ).json()
      );
  }
};

// SetAccessKeyHandle handle create a new actionRoom
exports.setAccessKeyHandle = async function (req, res) {
  const token = req.cookies.token;
  if (!token) {
    log.Error("[SetAccessKeyHandle] Can not get current user");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "actionRoom.invalidCurrentUser",
          "Can not get current user"
        ).json()
      );
  }

  const currentUserId = await actionRoomService.findIdByAccessToken(token);
  if (currentUserId == null || ownerUserId != currentUserId) {
    log.Error("[SetAccessKeyHandle] Can not get current user");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "actionRoom.invalidCurrentUser",
          "Can not get current user"
        ).json()
      );
  }
  try {
    const accessKey = actionRoomService.setAccessKey(currentUserId);
    return res.status(HttpStatusCode.OK).send({ accessKey: accessKey }).json();
  } catch (error) {
    log.Error("Set access key Error " + error);
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "actionRoom.setAccessKey",
          "Can not set access key!"
        ).json()
      );
  }
};
// DeleteActionRoomHandle handle delete a ActionRoom
exports.deleteActionRoomHandle = async function (req, res) {
  // params from /actions/room/:roomId
  const actionRoomId = req.Params.roomId;
  if (actionRoomId == "") {
    log.Error("ActionRoom Id is required!");
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "actionRoom.actionRoomIdRequired",
          "ActionRoom Id is required!"
        ).json()
      );
  }

  const token = req.cookies.token;
  if (!token) {
    log.Error("[SetAccessKeyHandle] Can not get current user");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "actionRoom.invalidCurrentUser",
          "Can not get current user"
        ).json()
      );
  }

  const currentUserId = await actionRoomService.findIdByAccessToken(token);
  if (currentUserId == null || ownerUserId != currentUserId) {
    log.Error("[DeleteActionRoomHandle] Can not get current user");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "actionRoom.invalidCurrentUser",
          "Can not get current user"
        ).json()
      );
  }
  try {
    const accessKey = actionRoomService.deleteActionRoomByOwner(
      currentUserId,
      actionRoomId
    );
    return res.status(HttpStatusCode.OK);
  } catch (error) {
    log.Error("Delete ActionRoom Error " + error);
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "actionRoom.actionRoomService",
          "Error happend while removing action room!"
        ).json()
      );
  }
};

// GetAccessKeyHandle handle get access key
exports.getAccessKeyHandle = async function (req, res) {
  const token = req.cookies.token;
  if (!token) {
    log.Error("[GetAccessKeyHandle] Can not get current user");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "actionRoom.invalidCurrentUser",
          "Can not get current user"
        ).json()
      );
  }

  const currentUserId = await actionRoomService.findIdByAccessToken(token);
  if (currentUserId == null || ownerUserId != currentUserId) {
    log.Error("[GetAccessKeyHandle] Can not get current user");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "actionRoom.invalidCurrentUser",
          "Can not get current user"
        ).json()
      );
  }

  try {
    const accessKey = actionRoomService.getAccessKey(currentUserId);
    return res.status(HttpStatusCode.OK).send({ accessKey: accessKey }).json();
  } catch (error) {
    log.Error("[actionRoomService.GetAccessKey] " + currentUserId + error);
    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        new utils.ErrorHandler(
          "actionRoom.getAccessKey",
          "Can not get access key!"
        ).json()
      );
  }
};

// VerifyAccessKeyHandle handle verify access key
exports.verifyAccessKeyHandle = async function (req, res) {
  const model = req.body;
  if (model == null) {
    log.Error("[VerifyAccessKeyHandle] Parse ActionVerifyModel Error");
    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        new utils.ErrorHandler(
          "actionRoom.parseActionVerifyModel",
          "Error happend while parsing ActionVerifyModel!"
        ).json()
      );
  }

  const token = req.cookies.token;
  if (!token) {
    log.Error("[VerifyAccessKeyHandle] Can not get current user");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "actionRoom.invalidCurrentUser",
          "Can not get current user"
        ).json()
      );
  }

  const currentUserId = await actionRoomService.findIdByAccessToken(token);
  if (currentUserId == null || ownerUserId != currentUserId) {
    log.Error("[VerifyAccessKeyHandle] Can not get current user");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "actionRoom.invalidCurrentUser",
          "Can not get current user"
        ).json()
      );
  }

  try {
    const isVerified = actionRoomService.verifyAccessKey(
      currentUserId,
      model.accessKey
    );
    return res
      .status(HttpStatusCode.OK)
      .send({ isVerified: isVerified })
      .json();
  } catch (error) {
    log.Error("Verify access key Error " + error);
    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        new utils.ErrorHandler(
          "actionRoom.actionRoomService",
          "Error happend while verifying access key!"
        ).json()
      );
  }
};

// CreateSettingGroupHandle handle create a new userSetting
exports.createSettingGroupHandle = async function (req, res) {
  const token = req.cookies.token;
  if (!token) {
    log.Error("[CreateSettingGroupHandle] Can not get current user");
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
    const currentUserId = await userSettingService.findIdByAccessToken(token);
    if (currentUserId == null || ownerUserId != currentUserId) {
      log.Error("[CreateSettingGroupHandle] Can not get current user");
      return res
        .status(HttpStatusCode.Unauthorized)
        .send(
          new utils.ErrorHandler(
            "setting.invalidCurrentUser",
            "Can not get current user"
          ).json()
        );
    }

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
    const currentUserId = await userSettingService.findIdByAccessToken(token);

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
    const currentUserId = await userSettingService.findIdByAccessToken(token);

    if (currentUserId == null || userID != currentUserId)
      res.status(HttpStatusCode.NotFound).end();

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
    const currentUserId = await userSettingService.findIdByAccessToken(token);

    if (currentUserId == null || userID != currentUserId)
      res.status(HttpStatusCode.Unauthorized).end();

    const settingType = req.params.type;
    if (!settingType) {
      log.Error("Error setting type can not be empty.");
      return res
        .status(HttpStatusCode.BadRequest)
        .send(
          new utils.ErrorHandler(
            "setting.settingTypeRquired",
            "Error setting type can not be empty.!"
          ).json()
        );
    }

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
    log.Error("[GetSettingByUserIds] Can not get current user");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "setting.invalidCurrentUser",
          "Can not get current user"
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
