const { appConfig } = require("../config");

const jwt = require("jsonwebtoken");

const UserSetting = require("../models/UserSetting");
const { v4: uuidv4 } = require("uuid");
// const MUUID = require("uuid-mongodb");

exports.saveManyUserSetting = async function (userSettingList) {
  try {
    let bulkItem = [];
    for (const setting of userSettingList) {
      if (setting.objectId == "") setting.objectId = uuidv4();
      if (setting.created_date == "")
        setting.created_date = Math.floor(Date.now() / 1000);
      bulkItem.push(setting);
    }
    const bulkWriteOpResult = await UserSetting.insertMany(bulkItem);
    console.log("BULK insert OK");
    console.log(JSON.stringify(bulkWriteOpResult, null, 2));
  } catch (error) {
    console.log("BULK insert error");
    console.log(JSON.stringify(err, null, 2));
  }
};
exports.updateUserSettingsById = async function (userSetting) {
  let bulkItem = [];
  userSetting.forEach((setting) => {
    let upsertDoc = {
      updateOne: {
        filter: {
          objectId: setting.objectId,
          OwnerUserId: setting.OwnerUserId,
        },
        update: {
          $set: setting,
        },
        upsert: true,
      },
    };
    bulkItem.push(upsertDoc);
  });
  UserSetting.collection
    .bulkWrite(bulkItem)
    .then((bulkWriteOpResult) => {
      console.log("BULK update OK");
      console.log(JSON.stringify(bulkWriteOpResult, null, 2));
    })
    .catch((err) => {
      console.log("BULK update error");
      console.log(JSON.stringify(err, null, 2));
    });
};
exports.deleteUserSettingByOwnerUserId = async function (userIds) {
  return UserSetting.deleteMany({ ownerUserId: { $in: userIds.split(",") } });
};

exports.findSettingByUserIds = async function (userIds, type) {
  return await UserSetting.find({
    ownerUserId: { $in: userIds.split(",") },
    type: type,
  });
};

exports.findIdByAccessToken = async function (token) {
  const decode = jwt.verify(token, appConfig.ACCESS_TPK);
  return decode.id;
};

exports.getAllUserSetting = async function (userId) {
  const userSetting = await UserSetting.find({ ownerUserId: userId });
  let groupSettingsMap = [];
  userSetting.forEach((setting) => {
    let settingModel = {
      objectId: setting.objectId,
      name: setting.name,
      value: setting.value,
      isSystem: setting.isSystem,
    };
    let type = [setting.type];
    groupSettingsMap = groupSettingsMap.concat(type, settingModel);
  });
  let groupSettingsModel = {
    type: userSetting[0].type,
    createdDate: userSetting[0].created_date,
    ownerUserId: userSetting[0].ownerUserId,
    list: groupSettingsMap,
  };

  return groupSettingsModel;
};
