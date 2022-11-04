const express = require("express");
const actionsRouter = express.Router();

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
actionsRouter.post(
  "/actions/room",
  hmacCookieHandlers(false),
  handlers.createActionRoomHandle
);

actionsRouter.put(
  "/actions/room",
  hmacCookieHandlers(true),
  handlers.updateActionRoomHandle
);
actionsRouter.get(
  "/actions/room/access-key",
  hmacCookieHandlers(true),
  handlers.getAccessKeyHandle
);
actionsRouter.put(
  "/actions/room/access-key",
  hmacCookieHandlers(true),
  handlers.setAccessKeyHandle
);
actionsRouter.post(
  "/actions/room/verify",
  hmacCookieHandlers(true),
  handlers.verifyAccessKeyHandle
);
actionsRouter.delete(
  "/actions/room/:roomId",
  hmacCookieHandlers(false),
  handlers.deleteActionRoomHandle
);
actionsRouter.post(
  "/actions/dispatch/:roomId",
  hmacCookieHandlers(false),
  handlers.dispatchHandle
);

module.exports = actionsRouter;
