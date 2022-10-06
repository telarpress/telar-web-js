const { appConfig } = require("../config");
const jwt = require("jsonwebtoken");
const Notification = require("../models/notification");
const { v4: uuidv4 } = require("uuid");
const { default: axios } = require("axios");
// const MUUID = require("uuid-mongodb");
const hmac = require("../../../core/middleware/authHMAC/authHMAC");

// GetLastNotifications find by owner user id
exports.getLastNotifications = async function () {
  const sortMap = {};
  const ne = {};
  const filter = {};
  sortMap["created_date"] = -1;
  ne["$ne"] = true;
  filter["isEmailSent"] = ne;
  // return s.FindNotificationsReceiver(filter, 10, 0, sortMap)
  return await Notification.find(filter).sort(sortMap);
};

// getUsersSettings Get users settings
exports.getUsersNotificationSettings = async function (userIds, userInfoInReq) {
  const url = "/setting/dto/ids";
  let model = models({
    UserIds: userIds,
    Type: "notification",
  });
  let payload = JSON.stringify(model);

  // Create user headers for http request
  let userHeaders = [];
  userHeaders["uid"] = userInfoInReq.userId.String();
  userHeaders["email"] = userInfoInReq.username;
  userHeaders["avatar"] = userInfoInReq.avatar;
  userHeaders["displayName"] = userInfoInReq.displayName;
  userHeaders["role"] = userInfoInReq.systemRole;

  const resData = functionCall(post, payload, url, userHeaders);
  if (resData == "") {
    return Error(`Cannot send request to ${url} - ${resData}`);
  }

  let parsedData = [];
  return parsedData;
};

async function functionCall(method, bytesReq, url, header) {
  let axiosConfig = {
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      "user-agent": "anyToActionRoom",
    },
  };
  const xCloudSignature = appConfig.HMAC_NAME;
  axiosConfig.headers[xCloudSignature] = "application/json";
  const digest = hmac.sign(bytesReq, process.env.HMAC_HEADER);
  console.log(`\ndigest: sha1=${digest}, header: ${xCloudSignature} \n`);

  if (!header) {
    for (let k = 0; k < header.length; k++) {
      for (let v = 0; v < header.length; v++) {
        axiosConfig.headers[header[k]] = header[v];
      }
    }
  }

  const httpReq = await axios.post(URL, bodyReader, axiosConfig);

  if (!httpReq) {
    console.log(
      `Error while sending admin check request!: callAPIWithHMAC ${httpReq}`
    );
    return Error(
      "Error while sending admin check request!: actionRoom/callAPIWithHMAC"
    );
  }
  console.info(httpReq);
  return await res.status(HttpStatusCode.OK).json(httpReq);
}

// UpdateEmailSent update bulk notification list
exports.updateEmailSent = async function (notifyIds) {
  let include = [];
  include["$in"] = notifyIds;

  let filter = [];
  filter["objectId"] = include;

  let updateOperator = new updateOperator({
    $set: {
      isEmailSent: true,
    },
  });
  try {
    Notification.updateMany(filter, updateOperator);
  } catch (error) {
    return error;
  }

  return true;
};

// SaveNotification save the notification
exports.saveNotification = function (model, currentUser) {
  let newNotification = new Notification({
    objectId: model.objectId,
    ownerUserId: currentUser.userID,
    ownerDisplayName: currentUser.displayName,
    ownerAvatar: currentUser.avatar,
    title: model.title,
    description: model.description,
    URL: model.URL,
    notifyRecieverUserId: model.notifyRecieverUserId,
    targetId: model.targetId,
    isSeen: false,
    type: model.type,
    emailNotification: model.emailNotification,
  });

  if (!newNotification.objectId) {
    try {
      newNotification.ObjectId = uuid.NewV4();
    } catch (uuidErr) {
      return uuidErr;
    }
  }

  if (newNotification.CreatedDate == 0) {
    newNotification.CreatedDate = utils.UTCNowUnix();
  }
  return newNotification.save();
};

// UpdateNotificationById update the notification
exports.updateNotificationById = function (model, currentUser) {
  let updatedNotification = new Notification({
    objectId: model.objectId,
    ownerUserId: currentUser.userID,
    ownerDisplayName: currentUser.displayName,
    ownerAvatar: currentUser.avatar,
    title: model.title,
    description: model.description,
    URL: model.URL,
    notifyRecieverUserId: model.notifyRecieverUserId,
    targetId: model.targetId,
    isSeen: model.isSeen,
    type: model.type,
    emailNotification: model.emailNotification,
  });

  let filter = {
    ObjectId: updatedNotification.ObjectId,
    OwnerUserId: updatedNotification.OwnerUserId,
  };

  let updateOperator = {
    $set: updatedNotification,
  };
  try {
    Notification.updateOne(filter, updatedNotification, updateOperator);
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
    Notification.updateOne(filter, updateOperator);
  } catch (error) {
    return error;
  }

  return true;
};

// SeenNotification update all notifications to seen
exports.seenAllNotifications = async function (userId) {
  let filter = {
    userId: userId,
  };

  let updateOperator = {
    $set: {
      isSeen: true,
    },
  };
  try {
    Notification.updateOne(filter, updateOperator);
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
    ObjectId: notificationId,
    NotifyRecieverUserId: notificationReceiverId,
  };
  try {
    Notification.deleteOne(filter, true);
  } catch (error) {
    return error;
  }
  return true;
};

// DeleteNotificationsByUserId delete notifications by userId
exports.deleteNotificationsByUserId = async function (userId) {
  let filter = {
    userId: userId,
  };
  try {
    Notification.deleteMany(filter);
  } catch (error) {
    return error;
  }
  return true;
};

// GetNotificationByUserId get all notifications by userId who receive the notification
exports.getNotificationByUserId = async function (userId, sortBy, page, limit) {
  let sortMap = [];
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
    return Notification.find(filter).sort(sortMap).limit(limit).skip(skip);
  } catch (error) {
    return error;
  }
}

// FindById find by notification id
exports.findById = async function (objectId) {
  let filter = {
    objectId: objectId,
  };
  try {
    return Notification.find(filter);
  } catch (error) {
    return error;
  }
};
