const express = require("express");
const actionsRouter = express.Router();

const {
  authCookieMiddleware,
} = require("../../../core/middleware/authcookie/authcookie");

const {
  authHMACMiddleware,
} = require("../../../core/middleware/authHMAC/authHMAC");

const handlers = require("../handlers");

// Router
actionsRouter.post(
  "/actions/room",
  authCookieMiddleware,
  handlers.createActionRoomHandle
);

actionsRouter.put(
  "/actions/room",
  authCookieMiddleware,
  handlers.updateActionRoomHandle
);
actionsRouter.get(
  "/actions/room/access-key",
  authCookieMiddleware,
  handlers.getAccessKeyHandle
);
actionsRouter.put(
  "/actions/room/access-key",
  authCookieMiddleware,
  handlers.setAccessKeyHandle
);
actionsRouter.post(
  "/actions/room/verify",
  authCookieMiddleware,
  handlers.verifyAccessKeyHandle
);
actionsRouter.delete(
  "/actions/room/:roomId",
  authCookieMiddleware,
  handlers.deleteActionRoomHandle
);
actionsRouter.post(
  "/actions/dispatch/:roomId",
  authCookieMiddleware,
  handlers.dispatchHandle
);

module.exports = actionsRouter;
