const { appConfig } = require("../config");
const jwt = require("jsonwebtoken");
const ActionRoom = require("../models/action-room");
const { v4: uuidv4 } = require("uuid");
const { default: axios } = require("axios");
// const MUUID = require("uuid-mongodb");

exports.findIdByAccessToken = async function (token) {
  const decode = jwt.verify(token, appConfig.ACCESS_TPK);
  return decode.id;
};

// SaveActionRoom save the actionRoom
exports.saveActionRoom = async function (actionRoom) {
  let uuid = uuidv4();
  let createdDateValue;
  //let uuid = MUUID.v1();
  if (settingCreationDate == 0) {
  } else {
    createdDateValue = settingCreationDate;
  }
  if (actionRoom.createdDate == 0) {
    actionRoom.createdDate = Math.floor(Date.now() / 1000);
  }
  return await ActionRoom.Save(actionRoom);
};

// UpdateActionRoom update the actionRoom
exports.updateActionRoomById = async function (data) {
  const filter = {
    objectId: data.objectId,
    OwnerUserId: data.OwnerUserId,
  };
  return await ActionRoom.updateOne(filter, { $set: data });
};

// SetAccessKey create access key for action room
exports.setAccessKey = async function (userId) {
  try {
    const filter = {
      OwnerUserId: userId,
    };
    let uuid = uuidv4();
    const accessKey = uuid;
    const updateOperator = { accessKey: accessKey.String() };
    const options = { upsert: true };
    await ActionRoom.updateOne(filter, updateOperator, options);
    return accessKey.String();
  } catch (updateErr) {
    return updateErr;
  }
};
// DeleteActionRoom delete actionRoom by ownerUserId and actionRoomId
exports.DeleteActionRoomByOwner = async function (OwnerUserId, ObjectId) {
  try {
    // const actionRoomUUID = uuidv4().FromString(ObjectId);
    const actionRoomUUID = uuidv4();
    const filter = {
      objectId: actionRoomUUID,
      ownerUserId: OwnerUserId,
    };
    return await await ActionRoom.deleteOne(filter);
  } catch (error) {
    return updateErr;
  }
};

// GetAccessKey increment score of post
exports.getAccessKey = async function (OwnerUserId) {
  const filter = {
    ownerUserId: OwnerUserId,
  };
  const foundActionRoom = ActionRoom.findOne(filter);

  return await foundActionRoom.accessKey;
};

// VerifyAccessKey increment score of post
exports.verifyAccessKey = async function (OwnerUserId, accessKey) {
  const filter = {
    ownerUserId: OwnerUserId,
    accessKey: accessKey,
  };
  const foundActionRoom = ActionRoom.findOne(filter);
  return foundActionRoom.objectId ? true : false;
};
