const actionRoomService = require("../services/action-room.service");
const utils = require("../../../core/utils/error-handler");
const { HttpStatusCode } = require("../../../core/utils/HttpStatusCode");
const log = require("../../../core/utils/errorLogger");
// const hmac = require("../utils/hmac");
const { appConfig } = require("../config");
// const { validate: uuidValidate } = require("uuid");
const { default: axios } = require("axios");

// CreateActionRoomHandle handle create a new actionRoom
exports.createActionRoomHandle = async function (req, res) {
  try {
    const currentUserId = res.locals.user.uid;
    if (!currentUserId || currentUserId == null) {
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

    const model = req.body;
    if (!model) {
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

    let newActionRoom = {
      objectId: model.objectId,
      ownerUserId: currentUserId,
      privateKey: model.privateKey,
      accessKey: model.accessKey,
      status: model.status,
      created_date: model.createdDate,
    };

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
exports.dispatchHandle = async function (req, res) {
  // params from /actions/dispatch/:roomId
  const actionRoomId = req.params.roomId;
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
  const bodyReader = req.body;
  const URL = `${appConfig.WEBSOCKET_SERVER_URL}/api/dispatch/${actionRoomId}`;
  log.Error(` Dispatch URL: ${URL}`);
  try {
    let axiosConfig = {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "user-agent": "anyToActionRoom",
      },
    };
    const xCloudSignature = appConfig.HMAC_NAME;
    axiosConfig.headers[appConfig.HMAC_NAME] = xCloudSignature;
    axiosConfig.headers["ORIGIN"] = appConfig.GATEWAY;
    const httpReq = await axios.post(URL, bodyReader, axiosConfig);

    if (!httpReq) {
      log.Error(`callAPIWithHMAC ${httpReq}`);
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
  const currentUserId = res.locals.user.uid;
  if (!currentUserId || currentUserId == null) {
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
    if (!model) {
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

    let updatedActionRoom = {
      objectId: model.objectId,
      ownerUserId: currentUserId,
      privateKey: model.privateKey,
      accessKey: model.accessKey,
      status: model.status,
      created_date: model.createdDate,
    };

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
  const currentUserId = res.locals.user.uid;
  if (!currentUserId || currentUserId == null) {
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
    const accessKey = await actionRoomService.setAccessKey(currentUserId);
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
  const actionRoomId = req.params.roomId;
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

  const currentUserId = res.locals.user.uid;
  if (!currentUserId || currentUserId == null) {
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
    const deleteAction = await actionRoomService.deleteActionRoomByOwner(
      currentUserId,
      actionRoomId
    );
    if (deleteAction.deletedCount == 0)
      return res
        .status(HttpStatusCode.NotFound)
        .send(
          new utils.ErrorHandler(
            "actionRoom.actionRoomService",
            "There is no action when removing the action room!"
          ).json()
        );
    return res.status(HttpStatusCode.OK).end();
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
  const currentUserId = res.locals.user.uid;
  if (!currentUserId || currentUserId == null) {
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
    const accessKey = await actionRoomService.getAccessKey(currentUserId);
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
  if (!model) {
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

  const currentUserId = res.locals.user.uid;
  if (!currentUserId || currentUserId == null) {
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
    const isVerified = await actionRoomService.verifyAccessKey(
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
