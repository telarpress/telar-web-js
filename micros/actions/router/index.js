const express = require("express");
const actionsRouter = express.Router();

const handlers = require("../handlers");

// Router
actionsRouter.post("/actions/room", handlers.createActionRoomHandle); //
actionsRouter.put("/actions/room", handlers.updateActionRoomHandle);
actionsRouter.get("/actions/room/access-key", handlers.getAccessKeyHandle);
actionsRouter.put("/actions/room/access-key", handlers.setAccessKeyHandle);
actionsRouter.post("/actions/room/verify", handlers.verifyAccessKeyHandle);
actionsRouter.delete("/actions/room/:roomId", handlers.deleteActionRoomHandle);
actionsRouter.post("/actions/dispatch/:roomId", handlers.dispatchHandle); //

module.exports = actionsRouter;
