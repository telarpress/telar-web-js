const express = require("express");
const actionsRouter = express.Router();

const {
  authMiddleware,
} = require("../../../core/middleware/authcookie/authcookie");
const handlers = require("../handlers");

// Router
actionsRouter.post(
  "/actions/room",
  authMiddleware,
  handlers.createActionRoomHandle
);

actionsRouter.put(
  "/actions/room",
  authMiddleware,
  handlers.updateActionRoomHandle
);
actionsRouter.get(
  "/actions/room/access-key",
  authMiddleware,
  handlers.getAccessKeyHandle
);
actionsRouter.put(
  "/actions/room/access-key",
  authMiddleware,
  handlers.setAccessKeyHandle
);
actionsRouter.post(
  "/actions/room/verify",
  authMiddleware,
  handlers.verifyAccessKeyHandle
);
actionsRouter.delete(
  "/actions/room/:roomId",
  authMiddleware,
  handlers.deleteActionRoomHandle
);
actionsRouter.post(
  "/actions/dispatch/:roomId",
  authMiddleware,
  handlers.dispatchHandle
);

module.exports = actionsRouter;
