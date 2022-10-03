const express = require("express");
const notificationsRouter = express.Router();

const {
  authCookieMiddleware,
} = require("../../../core/middleware/authcookie/authcookie");

const {
  authHMACMiddleware,
} = require("../../../core/middleware/authHMAC/index");

const handlers = require("../handlers");

// Router
notificationsRouter.post(
  "/notifications/check",
  authCookieMiddleware,
  handlers.checkNotifyEmailHandle
);
notificationsRouter.post(
  "/notifications/",
  authCookieMiddleware,
  handlers.createNotificationHandle
);
notificationsRouter.put(
  "/notifications/",
  authCookieMiddleware,
  handlers.updateNotificationHandle
);
notificationsRouter.put(
  "/notifications/seen/:notificationId",
  authCookieMiddleware,
  handlers.seenNotificationHandle
);
notificationsRouter.put(
  "/notifications/seenall",
  authCookieMiddleware,
  handlers.seenAllNotificationsHandle
);
notificationsRouter.delete(
  "/notifications/id/:notificationId",
  authCookieMiddleware,
  handlers.deleteNotificationHandle
);
notificationsRouter.delete(
  "/notifications/my",
  authCookieMiddleware,
  handlers.deleteNotificationByUserIdHandle
);
notificationsRouter.get(
  "/notifications/check",
  authCookieMiddleware,
  handlers.getNotificationsByUserIdHandle
);
notificationsRouter.get(
  "/notifications/:notificationId",
  authCookieMiddleware,
  handlers.getNotificationHandle
);

module.exports = notificationsRouter;
