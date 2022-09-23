const express = require("express");
const settingRouter = express.Router();

const handlers = require("../handlers");

// Router
settingRouter.post("/setting", handlers.createSettingGroupHandle);
settingRouter.put("/setting", handlers.updateUserSettingHandle);
settingRouter.delete("/setting", handlers.deleteUserAllSettingHandle);
settingRouter.get("/setting", handlers.getAllUserSetting);
// DTO handlers
settingRouter.post("/setting/dto/ids", handlers.getSettingByUserIds);

module.exports = settingRouter;
