const { appConfig } = require("../config");

const jwt = require("jsonwebtoken");

const UserSetting = require("../models/UserSetting");
const { v4: uuidv4 } = require("uuid");
// const MUUID = require("uuid-mongodb");

exports.saveManyUserSetting = async function (
  settingType,
  settingCreationDate,
  settingOwnerUserId,
  settingList
) {
  const decode = jwt.verify(token, appConfig.ACCESS_TPK);
  if (decode.id != settingOwnerUserId) return Error("Error in Authentication");

  // TODO: Use  canonical Base64 UUID
  // const mUUID = MUUID.mode("canonical");

  settingList.forEach((setting) => {
    let uuid = uuidv4();
    let createdDateValue;
    //let uuid = MUUID.v1();
    if (settingCreationDate == 0) {
      createdDateValue = Math.floor(Date.now() / 1000);
    } else {
      createdDateValue = settingCreationDate;
    }
    let newUserSetting = new UserSetting({
      objectId: uuid,
      // ownerUserId: MUUID.from(settingOwnerUserId),
      ownerUserId: settingOwnerUserId,
      createdDate: createdDateValue,
      name: setting.name,
      value: setting.value,
      type: settingType,
      isSystem: setting.isSystem,
    });

    return UserSetting(newUserSetting).save();
  });
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
exports.deleteUserSettingByOwnerUserId = async function (userId) {
  return UserSetting.deleteMany({ ownerUserId: userId });
};

exports.findSettingByUserIds = async function (userIds, type, token) {
  return UserSetting.find({
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
    let settingModel = new Object({
      objectId: setting.objectId,
      name: setting.name,
      value: setting.value,
      isSystem: setting.isSystem,
    });
    let type = [setting.type];
    groupSettingsMap = groupSettingsMap.concat(type, settingModel);
  });
  let groupSettingsModel = new Object({
    Type: userSetting[0].type,
    CreatedDate: userSetting[0].createdDate,
    OwnerUserId: userSetting[0].ownerUserId,
    List: groupSettingsMap,
  });

  return groupSettingsModel;
};
