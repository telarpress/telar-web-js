const express = require("express");
const settingRouter = express.Router();
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
settingRouter.post(
  "/setting",
  hmacCookieHandlers(true),
  handlers.createSettingGroupHandle
);
settingRouter.put(
  "/setting",
  hmacCookieHandlers(true),
  handlers.updateUserSettingHandle
);
settingRouter.delete(
  "/setting",
  hmacCookieHandlers(true),
  handlers.deleteUserAllSettingHandle
);
settingRouter.get(
  "/setting",
  hmacCookieHandlers(true),
  handlers.getAllUserSetting
);
// DTO handlers
settingRouter.post(
  "/setting/dto/ids",
  hmacCookieHandlers(false),
  handlers.getSettingByUserIds
);

module.exports = settingRouter;
