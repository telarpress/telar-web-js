const { appConfig } = require("../config");
const jwt = require("jsonwebtoken");
const ActionRoom = require("../models/action-room");
const { v4: uuidv4 } = require("uuid");
const { default: axios } = require("axios");
// const MUUID = require("uuid-mongodb");

// SaveActionRoom save the actionRoom
exports.saveActionRoom = async function (actionRoom) {
  if (actionRoom.createdDate == 0)
    actionRoom.createdDate = Math.floor(Date.now() / 1000);

  const actionRoomModel = new ActionRoom(actionRoom);
  return await actionRoomModel.save();
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
    const accessKey = uuidv4();
    const updateOperator = { accessKey: accessKey.toString() };
    await ActionRoom.updateOne(filter, { $set: updateOperator });
    return accessKey;
  } catch (updateErr) {
    return updateErr;
  }
};
// DeleteActionRoom delete actionRoom by ownerUserId and actionRoomId
exports.deleteActionRoomByOwner = async function (OwnerUserId, actionRoomUUID) {
  try {
    const filter = {
      objectId: actionRoomUUID,
      ownerUserId: OwnerUserId,
    };
    return await ActionRoom.deleteOne(filter);
  } catch (error) {
    return updateErr;
  }
};

// GetAccessKey increment score of post
exports.getAccessKey = async function (ownerUserId) {
  const filter = {
    ownerUserId: ownerUserId,
  };
  return await ActionRoom.findOne(filter);
};

// VerifyAccessKey increment score of post
exports.verifyAccessKey = async function (OwnerUserId, accessKey) {
  return (
    await ActionRoom.findOne({
      ownerUserId: OwnerUserId,
      accessKey: accessKey,
    })
  ).objectId
    ? true
    : false;
};
