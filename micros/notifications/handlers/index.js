const notificationService = require("../services/notification.service");
const utils = require("../../../core/utils/error-handler");
const { HttpStatusCode } = require("../../../core/utils/HttpStatusCode");
const log = require("../../../core/utils/errorLogger");
const { appConfig } = require("../config");
// const { validate: uuidValidate } = require("uuid");
const { default: axios } = require("axios");
const { sendEmail } = require("../utils/sendEmail");

// CheckNotifyEmailHandle handle query on notification
exports.checkNotifyEmailHandle = async function (req, res) {
  try {
    const notificationList = await notificationService.getLastNotifications();
    if (notificationList.length <= 0) {
      return res.status(HttpStatusCode.OK).send();
    }

    let recIds = [];
    notificationList.forEach((notification) => {
      notification.isEmailSent = true;
      recIds.push(notification.notifyRecieverUserId);
    });

    const currentUserId = res.locals.user;
    if (!currentUserId || currentUserId == null) {
      log.Error("[CheckNotifyEmailHandle] Can not get current user");
      return res
        .status(HttpStatusCode.Unauthorized)
        .send(
          new utils.ErrorHandler(
            "notification.invalidCurrentUser",
            "Can not get current user"
          ).json()
        );
    }

    let userInfoInReq = new userInfoInReq({
      userId: currentUser.userId,
      username: currentUser.email,
      avatar: currentUser.avatar,
      displayName: currentUser.displayName,
      systemRole: currentUser.role,
    });

    const mappedSettings = notificationService.getUsersNotificationSettings(
      recIds,
      userInfoInReq
    );
    if (!mappedSettings) {
      log.Error(
        `[CheckNotifyEmailHandle] getUsersNotificationSettings ${error}`
      );
      return res
        .status(HttpStatusCode.InternalServerError)
        .send(
          new utils.ErrorHandler(
            "notification.notificationSettings",
            "Error happened while getting user notification setting!"
          ).json()
        );
    }

    let updateNotifyIds = [];

    notificationList.forEach((notification) => {
      let key = getSettingPath(
        notification.notifyRecieverUserId,
        notificationSettingType,
        settingMappedFromNotify[notification.Type]
      );
      if (mappedSettings[key] == "true") {
        log.Error(
          `Sending notify email to ${notification.notifyRecieverEmail}`
        );

        notification.title = getNotificationTitleByType(
          notification.type,
          notification.ownerDisplayName
        );
        let emailData = {
          AppName: appConfig.AppName,
          AppURL: appConfig.WebURL,
          Title: notification.title,
          Avatar: notification.ownerAvatar,
          FullName: notification.ownerDisplayName,
          ViewLink: appConfig.WebURL + notification.URL,
          UnsubscribeLink: appConfig.WebURL + "settings/notification",
        };

        try {
          sendEmailNotification(notification, emailData);
        } catch (error) {
          log.Error("Send email notification - ${error}");
        }

        log.Error(
          `notification email sent to ${notification.notifyRecieverEmail}`
        );
      }
    });

    updateNotifyIds.push(notification.objectId);

    if (updateNotifyIds.length > 0) {
      const updateEmail = notificationService.updateEmailSent(updateNotifyIds);
      if (!updateEmail) {
        log.Error("Update last notifications - ${error}");
        log.Error("[CheckNotifyEmailHandle.UpdateEmailSent] ${error}");
        return res
          .status(HttpStatusCode.InternalServerError)
          .send(
            new utils.ErrorHandler(
              "notification.updateEmailSent",
              "Error happened while updating notification!"
            ).json()
          );
      }
    }

    return res.status(HttpStatusCode.OK).send();
  } catch (error) {
    log.Error(`[checkNotifyEmailHandle] ${error}`);
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "notification.GetLastNotifications",
          "Error happened while getting notification list!"
        ).json()
      );
  }
};

// sendEmailNotification Send email notification
function sendEmailNotification(model, emailBody) {
  let subject = `${appConfig.AppName} Notification - ${model.title}`;
  try {
    let emailResStatus = sendEmail(
      model.notifyRecieverEmail,
      subject,
      emailBody
    );
    if (!emailResStatus) {
      log.Error("Email response status is false!");
    }
  } catch (error) {
    log.Error(`[sendEmailNotification] ${error}`);
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "notification.sendEmailNotification",
          "Error happened in sending email error"
        ).json()
      );
  }
  return true;
}

// getNotificationTitle get notification title by notification type
function getNotificationTitleByType(notificationType, OwnerDisplayName) {
  let title = "";
  switch (notificationType) {
    case likeNotifyType:
      title = `${OwnerDisplayName} liked your post.`;
    case commentNotifyType:
      title = `${OwnerDisplayName}  added a comment on your post.`;
    case followNotifyType:
      title = `${OwnerDisplayName}  now following you.`;
  }
  return title;
}

// getSettingPath
function getSettingPath(userId, settingType, settingKey) {
  return `${userId}:${settingType}:${settingKey}`;
}

// CreateNotificationHandle handle create a new notification
exports.createNotificationHandle = async function (req, res) {
  try {
    const currentUser = res.locals.user;
    if (!currentUser || currentUser == null) {
      log.Error("[CreateNotificationHandle] Can not get current user");
      return res
        .status(HttpStatusCode.Unauthorized)
        .send(
          new utils.ErrorHandler(
            "notification.invalidCurrentUser",
            "Can not get current user"
          ).json()
        );
    }

    const model = req.body;
    if (!model) {
      log.Error(
        "[CreateNotificationHandle] Parse CreateNotificationModel Error"
      );
      return res
        .status(HttpStatusCode.BadRequest)
        .send(
          new utils.ErrorHandler(
            "notification.parseCreateNotificationModel",
            "Parse CreateNotificationModel Error"
          ).json()
        );
    }

    let newNotification = {
      objectId: model.objectId,
      ownerUserId: currentUser.userId,
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
    };
    try {
      await notificationService.saveNotification(newNotification);
    } catch (error) {
      log.Error(`Save Notification Error ${error}`);
      return res
        .status(HttpStatusCode.InternalServerError)
        .send(
          new utils.ErrorHandler(
            "notification.saveNotification",
            "Error happened while saving notification!"
          ).json()
        );
    }

    // Send notification
    const actionURL = `/actions/dispatch/${model.notifyRecieverUserId}`;
    let notificationList = {};
    notificationList[newNotification.objectId] = newNotification;
    let notificationAction = {
      type: "ADD_PLAIN_NOTIFY_LIST",
      payload: notificationList,
    };

    let notificationActionBytes = JSON.stringify(notificationAction);
    if (!notificationActionBytes) {
      log.Error(`Marshal notification Error ${error}`);
    }

    try {
      const config = {
        headers: {
          uid: currentUser.userId,
          email: currentUser.email,
          avatar: currentUser.avatar,
          displayName: currentUser.displayName,
          role: currentUser.role,
        },
        timeout: 1000,
      };
      const response = await axios.post(
        actionURL,
        notificationActionBytes,
        config
      );
      console.log(response.data);
      return res.send({ objectId: newNotification.objectId }).json();
    } catch (error) {
      if (axios.isAxiosError(error))
        log.Error(`Cannot send action request! error ${error}`);
    }
  } catch (error) {
    log.Error(`[createNotificationHandle] - Save Notification Error ${error}`);
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "notification.saveNotification",
          "Save Notification Error!"
        ).json()
      );
  }
};

// UpdateNotificationHandle handle update a notification
exports.updateNotificationHandle = async function (req, res) {
  try {
    const currentUser = res.locals.user;
    if (!currentUser || currentUser == null) {
      log.Error("[UpdateNotificationHandle] Can not get current user");
      return res
        .status(HttpStatusCode.Unauthorized)
        .send(
          new utils.ErrorHandler(
            "notification.invalidCurrentUser",
            "Can not get current user"
          ).json()
        );
    }

    const model = req.body;
    if (!model) {
      log.Error(
        "[UpdateNotificationHandle] Parse UpdateNotificationModel Error"
      );
      return res
        .status(HttpStatusCode.BadRequest)
        .send(
          new utils.ErrorHandler(
            "notification.parseUpdateNotificationModel",
            "Parse UpdateNotificationModel Error"
          ).json()
        );
    }

    try {
      await notificationService.updateNotificationById(model, currentUser);
    } catch (error) {
      log.Error(
        `[UpdateNotificationHandle] - Update Notification Error ${error}`
      );
      return res
        .status(HttpStatusCode.InternalServerError)
        .send(
          new utils.ErrorHandler(
            "notification.updateNotification",
            "Error happened while updating notification!"
          ).json()
        );
    }

    return res.status(HttpStatusCode.OK).send();
  } catch (error) {
    log.Error(
      `[UpdateNotificationHandle] - Update Notification Error ${error}`
    );
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "notification.updateNotification",
          " Update Notification Error!"
        ).json()
      );
  }
};

// SeenNotificationHandle handle set notification seen
exports.seenNotificationHandle = async function (req, res) {
  // params from /notifications/seen/:notificationId
  const notificationId = req.params.notificationId;
  if (!notificationId) {
    log.Error("Notification Id is required!");
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "notification.notificationIdRequired",
          "Notification id is required!"
        ).json()
      );
  }

  let notificationUUID = notificationId;
  if (!notificationUUID) {
    log.Error("UUID Error");
    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        new utils.ErrorHandler(
          "notification.parseUUID",
          "Can not parse UUID!"
        ).json()
      );
  }

  try {
    const currentUserId = res.locals.user.uid;
    if (!currentUserId || currentUserId == null) {
      log.Error("[SeenNotificationHandle] Can not get current user");
      return res
        .status(HttpStatusCode.Unauthorized)
        .send(
          new utils.ErrorHandler(
            "notification.invalidCurrentUser",
            "Can not get current user"
          ).json()
        );
    }

    notificationService.seenNotification(notificationUUID, currentUserId);

    return res.status(HttpStatusCode.OK).send();
  } catch (error) {
    log.Error(`Update Notification Error ${error}`);
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "notification.updateNotification",
          "Update Notification Error!"
        ).json()
      );
  }
};

// SeenAllNotificationsHandle handle set all notifications seen
exports.seenAllNotificationsHandle = async function (req, res) {
  try {
    const currentUserId = res.locals.user.uid;
    if (!currentUserId || currentUserId == null) {
      log.Error("[SeenAllNotificationHandle] Can not get current user");
      return res
        .status(HttpStatusCode.Unauthorized)
        .send(
          new utils.ErrorHandler(
            "notification.invalidCurrentUser",
            "Can not get current user"
          ).json()
        );
    }
    const existNotification = await notificationService.findById(currentUserId);
    if (Array.isArray(existNotification) && !existNotification.length) {
      return res
        .status(HttpStatusCode.BadRequest)
        .send(
          new utils.ErrorHandler(
            "notification.seenAllNotification",
            "Seen All Notification Bad Request!"
          ).json()
        );
    }
    notificationService.seenAllNotifications(currentUserId);
    return res.status(HttpStatusCode.OK).send();
  } catch (error) {
    log.Error(`Seen All Notification Error ${error}`);
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "notification.seenAllNotification",
          "Seen All Notification Error!"
        ).json()
      );
  }
};

// DeleteNotificationHandle handle delete a Notification
exports.deleteNotificationHandle = async function (req, res) {
  // params from /notifications/id/:notificationId
  const notificationId = req.params.notificationId;
  if (!notificationId) {
    log.Error("Notification Id is required!");
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "notification.notificationIdRequired",
          "Notification id is required!"
        ).json()
      );
  }

  let notificationUUID = notificationId;
  if (!notificationUUID) {
    log.Error("UUID Error");
    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        new utils.ErrorHandler(
          "notification.parseUUID",
          "Can not parse UUID!"
        ).json()
      );
  }

  try {
    const currentUserId = res.locals.user.uid;
    if (!currentUserId || currentUserId == null) {
      log.Error("[DeleteNotificationHandle] Can not get current user");
      return res
        .status(HttpStatusCode.Unauthorized)
        .send(
          new utils.ErrorHandler(
            "notification.invalidCurrentUser",
            "Can not get current user"
          ).json()
        );
    }

    notificationService.deleteNotificationByOwner(
      currentUserId,
      notificationUUID
    );

    return res.status(HttpStatusCode.OK).send();
  } catch (error) {
    log.Error(`Delete Notification Error ${error}`);
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "notification.deleteNotification",
          "Delete Notification Error!"
        ).json()
      );
  }
};

// DeleteNotificationByUserIdHandle handle delete a Notification but userId
exports.deleteNotificationByUserIdHandle = async function (req, res) {
  try {
    const currentUserId = res.locals.user.uid;
    if (!currentUserId || currentUserId == null) {
      log.Error("[DeleteNotificationByUserIdHandle] Can not get current user");
      return res
        .status(HttpStatusCode.Unauthorized)
        .send(
          new utils.ErrorHandler(
            "notification.invalidCurrentUser",
            "Can not get current user"
          ).json()
        );
    }

    notificationService.deleteNotificationsByUserId(currentUserId);

    return res.status(HttpStatusCode.OK).send();
  } catch (error) {
    log.Error(`Delete Notification Error ${error}`);
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "notification.deleteNotification",
          "Delete Notification Error!"
        ).json()
      );
  }
};

// GetNotificationsByUserIdHandle handle query on notification
exports.getNotificationsByUserIdHandle = async function (req, res) {
  try {
    const currentUserId = res.locals.user.uid;
    if (!currentUserId || currentUserId == null) {
      log.Error("[GetNotificationsByUserIdHandle] Can not get current user");
      return res
        .status(HttpStatusCode.Unauthorized)
        .send(
          new utils.ErrorHandler(
            "notification.invalidCurrentUser",
            "Can not get current user"
          ).json()
        );
    }

    const notificationList = notificationService.getNotificationByUserId(
      currentUserId,
      "created_date",
      req.body.page,
      req.body.limit
    );

    return res.send(notificationList);
  } catch (error) {
    log.Error(
      `[GetNotificationsByUserIdHandle] Error happened while reading notification ${error}`
    );
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "notification.getNotificationByUserId",
          "Error happened while reading notification!"
        ).json()
      );
  }
};

// GetNotificationHandle handle get a notification
exports.getNotificationHandle = async function (req, res) {
  // params from /notifications/:notificationId
  const notificationId = req.params.notificationId;
  if (!notificationId) {
    log.Error("Notification Id is required!");
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "notification.notificationIdRequired",
          "Notification id is required!"
        ).json()
      );
  }

  let notificationUUID = notificationId;
  if (!notificationUUID) {
    log.Error("UUID Error");
    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        new utils.ErrorHandler(
          "notification.parseUUID",
          "Can not parse UUID!"
        ).json()
      );
  }

  try {
    const foundNotification = notificationService.findById(notificationUUID);
    const currentUserId = res.locals.user;
    if (!currentUserId || currentUserId == null) {
      log.Error("[GetNotificationHandle] Can not get current user");
      return res
        .status(HttpStatusCode.Unauthorized)
        .send(
          new utils.ErrorHandler(
            "notification.invalidCurrentUser",
            "Can not get current user"
          ).json()
        );
    }

    const notificationModel = {
      objectId: foundNotification.objectId,
      ownerUserId: currentUserId.userId,
      ownerDisplayName: currentUserId.displayName,
      ownerAvatar: currentUserId.avatar,
      title: foundNotification.title,
      description: foundNotification.description,
      URL: foundNotification.URL,
      notifyRecieverUserId: foundNotification.notifyRecieverUserId,
      targetId: foundNotification.targetId,
      isSeen: foundNotification.isSeen,
      type: foundNotification.type,
      emailNotification: foundNotification.emailNotification,
    };

    return res.send(notificationModel);
  } catch (error) {
    log.Error(
      `[GetNotificationHandle.notificationService.FindById] ${notificationUUID} ${error}`
    );
    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        new utils.ErrorHandler(
          "notification.findNotification",
          "Error happened while finding notification!"
        ).json()
      );
  }
};
