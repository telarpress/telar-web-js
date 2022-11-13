const { appConfig } = require("../config");
const jwt = require("jsonwebtoken");
const Notification = require("../models/Notification");
const { v4: uuidv4 } = require("uuid");
const { default: axios } = require("axios");
const GateKeeper = require("../utils/hmac");
// const MUUID = require("uuid-mongodb");
const hmac = require("../../../core/middleware/authHMAC/authHMAC");
const numberOfItems = 10;
// GetLastNotifications find by owner user id
exports.getLastNotifications = async function () {
  const sortMap = {};
  const ne = {};
  const filter = {};
  sortMap["created_date"] = -1;
  ne["$ne"] = true;
  filter["isEmailSent"] = ne;
  return await findNotificationsReceiver(filter, 10, 0, sortMap);
};

async function findNotificationsReceiver(filter, limit, skip, sort) {
  var pipeline = [];

  let matchOperator = {};
  matchOperator["$match"] = filter;

  let sortOperator = {};
  sortOperator["$sort"] = sort;
  pipeline.push(matchOperator, sortOperator);

  if (skip > 0) {
    let skipOperator = {};
    skipOperator["$skip"] = skip;
    pipeline.push(skipOperator);
  }

  if (limit > 0) {
    let limitOperator = {};
    limitOperator["$limit"] = limit;
    pipeline.push(limitOperator);
  }

  let lookupOperator = {};
  lookupOperator["$lookup"] = {
    localField: "notifyRecieverUserId",
    from: "userProfile",
    foreignField: "objectId",
    as: "userinfo",
  };

  let unwindOperator = {};
  unwindOperator["$unwind"] = "$userinfo";

  let projectOperator = {};
  let project = {};

  project["objectId"] = 1;
  project["ownerUserId"] = 1;
  project["ownerDisplayName"] = 1;
  project["ownerAvatar"] = 1;
  project["created_date"] = 1;
  project["description"] = 1;
  project["url"] = 1;
  project["notifyRecieverUserId"] = 1;
  project["notifyRecieverEmail"] = "$userinfo.email";
  project["targetId"] = 1;
  project["isSeen"] = 1;
  project["type"] = 1;
  project["emailNotification"] = 1;
  project["isEmailSent"] = 1;

  projectOperator["$project"] = project;

  pipeline.push(lookupOperator, unwindOperator, projectOperator);
  return await Notification.aggregate(pipeline);
}

// getUsersSettings Get users settings
exports.getUsersNotificationSettings = async function (userIds, userInfoInReq) {
  const url = "/setting/dto/ids";
  let model = {
    UserIds: userIds,
    Type: "notification",
  };

  // Create user headers for http request
  let userHeaders = {};
  userHeaders["uid"] = userInfoInReq.userId;
  userHeaders["email"] = userInfoInReq.username;
  userHeaders["avatar"] = userInfoInReq.avatar;
  userHeaders["displayName"] = userInfoInReq.displayName;
  userHeaders["role"] = userInfoInReq.systemRole;

  const resData = await microCall(post, model, url, userHeaders);
  if (resData == "") {
    return Error(`Cannot send request to ${url} - ${resData}`);
  }

  return resData;
};

// microCall send request to another function/microservice using cookie validation
/**
 *
 * @param {'get' | 'GET'
  | 'delete' | 'DELETE'
  | 'head' | 'HEAD'
  | 'options' | 'OPTIONS'
  | 'post' | 'POST'
  | 'put' | 'PUT'
  | 'patch' | 'PATCH'
  | 'purge' | 'PURGE'
  | 'link' | 'LINK'
  | 'unlink' | 'UNLINK'} method
 * @param {*} data
 * @param {string} url
 * @param {*} headers
 */
const microCall = async (method, data, url, headers = {}) => {
  try {
    const digest = GateKeeper.sign(JSON.stringify(data), process.env.HMAC_KEY);
    headers["Content-type"] = "application/json";
    headers[appConfig.HMAC_NAME] = digest;

    console.log(`\ndigest: ${digest}, header: ${appConfig.HMAC_NAME} \n`);

    const result = await axios({
      method: method,
      data,
      url: appConfig.InternalGateway + url,
      headers,
    });

    return result.data;
  } catch (error) {
    // handle axios error and throw correct error
    // https://github.com/axios/axios#handling-errors
    console.log(
      `Error while sending admin check request!: callAPIWithHMAC ${httpReq}`
    );
    return Error(
      "Error while sending admin check request!: actionRoom/callAPIWithHMAC"
    );
  }
};

// UpdateEmailSent update bulk notification list
exports.updateEmailSent = async function (notifyIds) {
  let include = {};
  include["$in"] = notifyIds;

  let filter = {};
  filter["objectId"] = include;

  let updateOperator = {
    $set: {
      isEmailSent: true,
    },
  };
  try {
    return await Notification.updateMany(filter, updateOperator);
  } catch (error) {
    return error;
  }

  return true;
};

// SaveNotification save the notification
exports.saveNotification = async function (newNotification) {
  if (!newNotification.objectId) {
    try {
      newNotification.objectId = uuidv4();
    } catch (uuidErr) {
      return uuidErr;
    }
  }

  if (newNotification.CreatedDate == 0) {
    newNotification.CreatedDate = utils.UTCNowUnix();
  }
  return await Notification(newNotification).save();
};

// UpdateNotificationById update the notification
exports.updateNotificationById = async function (model, currentUser) {
  let updatedNotification = {
    objectId: model.objectId,
    ownerUserId: currentUser.userId,
    ownerDisplayName: currentUser.displayName,
    ownerAvatar: currentUser.avatar,
    title: model.title,
    description: model.description,
    url: model.url,
    notifyRecieverUserId: model.notifyRecieverUserId,
    targetId: model.targetId,
    isSeen: model.isSeen,
    type: model.type,
    emailNotification: model.emailNotification,
  };

  let filter = {
    objectId: updatedNotification.objectId,
    ownerUserId: updatedNotification.ownerUserId,
  };

  let updateOperator = {
    $set: updatedNotification,
  };
  try {
    await Notification.updateOne(filter, updateOperator);
  } catch (error) {
    return error;
  }

  return true;
};

// SeenNotification update the notification to seen
exports.seenNotification = async function (objectId, userId) {
  let filter = {
    objectId: objectId,
    userId: userId,
  };

  let updateOperator = {
    $set: {
      isSeen: true,
    },
  };
  try {
    await Notification.updateOne(filter, updateOperator);
  } catch (error) {
    return error;
  }

  return true;
};

// SeenNotification update all notifications to seen
exports.seenAllNotifications = async function (userId) {
  let filter = {
    notifyRecieverUserId: userId,
  };

  let updateOperator = {
    $set: {
      isSeen: true,
    },
  };
  try {
    await Notification.updateOne(filter, updateOperator);
  } catch (error) {
    return error;
  }

  return true;
};

// DeleteNotification delete notification by notificationReceiverId and notificationId
exports.deleteNotificationByOwner = async function (
  notificationReceiverId,
  notificationId
) {
  let filter = {
    objectId: notificationId,
    notifyRecieverUserId: notificationReceiverId,
  };
  try {
    await Notification.deleteOne(filter, true);
  } catch (error) {
    return error;
  }
  return true;
};

// DeleteNotificationsByUserId delete notifications by userId
exports.deleteNotificationsByUserId = async function (userId) {
  let filter = {
    notifyRecieverUserId: userId,
  };
  try {
    await Notification.deleteMany(filter);
  } catch (error) {
    return error;
  }
  return true;
};

// GetNotificationByUserId get all notifications by userId who receive the notification
exports.getNotificationByUserId = async function (userId, sortBy, page, limit) {
  let sortMap = {};
  sortMap[sortBy] = -1;
  let skip = numberOfItems * (page - 1);

  let filter = {
    notifyRecieverUserId: userId,
  };
  try {
    return await findNotificationList(filter, limit, skip, sortMap);
  } catch (error) {
    return error;
  }
};

// FindNotificationList get all notifications by filter
async function findNotificationList(filter, limit, skip, sortMap) {
  try {
    return await Notification.find(filter)
      .sort(sortMap)
      .limit(limit)
      .skip(skip);
  } catch (error) {
    return error;
  }
}

// FindById find by notification id
exports.findById = async function (objectId) {
  let filter = {
    notifyRecieverUserId: objectId,
  };
  try {
    return await Notification.find(filter);
  } catch (error) {
    return error;
  }
};
