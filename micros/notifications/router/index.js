const express = require("express");
const notificationsRouter = express.Router();
const { appConfig } = require("../config");
const {
  authCookie,
} = require("../../../core/middleware/authcookie/authcookie");

const { authHMAC } = require("../../../core/middleware/authHMAC/");
const hmacCookieHandlers = (hmacWithCookie) => (req, res, next) => {
  if (req.get(appConfig.HMAC_NAME) !== undefined || !hmacWithCookie) {
    return authHMAC(req, res, next);
  }
  return authCookie(req, res, next);
};

const handlers = require("../handlers");

// Router
notificationsRouter.post(
  "/notifications/check",
  hmacCookieHandlers(false),
  handlers.checkNotifyEmailHandle
);
notificationsRouter.post(
  "/notifications/",
  hmacCookieHandlers(false),
  handlers.createNotificationHandle
);
notificationsRouter.put(
  "/notifications/",
  hmacCookieHandlers(false),
  handlers.updateNotificationHandle
);
notificationsRouter.put(
  "/notifications/seen/:notificationId",
  hmacCookieHandlers,
  handlers.seenNotificationHandle
);
notificationsRouter.put(
  "/notifications/seenall",
  hmacCookieHandlers,
  handlers.seenAllNotificationsHandle
);
notificationsRouter.delete(
  "/notifications/id/:notificationId",
  hmacCookieHandlers,
  handlers.deleteNotificationHandle
);
notificationsRouter.delete(
  "/notifications/my",
  hmacCookieHandlers,
  handlers.deleteNotificationByUserIdHandle
);
notificationsRouter.get(
  "/notifications/check",
  hmacCookieHandlers,
  handlers.getNotificationsByUserIdHandle
);
notificationsRouter.get(
  "/notifications/:notificationId",
  hmacCookieHandlers,
  handlers.getNotificationHandle
);

module.exports = notificationsRouter;
