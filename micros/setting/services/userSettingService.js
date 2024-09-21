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
  try {
    const userSettings = await UserSetting.find({
      ownerUserId: userId,
    }).exec();

    const mappedSettings = userSettings.reduce((acc, setting) => {
      const { _id, name, value, type, isSystem } = setting;
      const formattedSetting = {
        objectId: _id.toString(),
        name,
        value,
        isSystem,
      };

      if (!acc[type]) {
        acc[type] = [];
      }

      acc[type].push(formattedSetting);
      return acc;
    }, {});

    return mappedSettings;
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return {};
  }
};

exports.getUserSettingById = async function (userId) {
  return await UserSetting.find({
    ownerUserId: userId,
  });
};

exports.deleteUserSettingById = async function (userId) {
  return await UserSetting.deleteMany({
    ownerUserId: userId,
  });
};

exports.getUserSettings = async function (ownerUserId, page, search, type) {
  // let sortMap = {};
  // sortMap["sortBy"] = -1;
  // let skip = numberOfItems * (page - 1);

  let filter = {
    ownerUserId: ownerUserId,
    name: search,
    type: type,
  };
  try {
    return await findUserSettingsList(filter);
  } catch (error) {
    return error;
  }
};
// FindUserSettingsList get all settings by filter
async function findUserSettingsList(filter) {
  try {
    return await UserSetting.find(filter);
  } catch (error) {
    return error;
  }
}

exports.createUserSettings = async function (ownerUserId, name, type, value) {
  let filter = {
    ownerUserId: ownerUserId,
    name: name,
    value: value,
    type: type,
  };
  try {
    return await UserSetting.insertMany(filter);
  } catch (error) {
    return error;
  }
};
