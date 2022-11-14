const express = require("express");
const adminRouter = express.Router();
const { appConfig } = require("../config");
const {
  authCookie,
} = require("../../../core/middleware/authcookie/authcookie");

const { authHMAC } = require("../../../core/middleware/authHMAC/");
const { authrole } = require("../../../core/middleware/authrole");
const hmacCookieHandlers = (hmacWithCookie) => (req, res, next) => {
  if (req.get(appConfig.HMAC_NAME) !== undefined || !hmacWithCookie) {
    return authHMAC(req, res, next);
  }
  return authCookie(req, res, next);
};

const authRoleMiddleware = () => (req, res, next) => {
  return authrole(req, res, next);
};
const handlers = require("../handlers");
// Router
adminRouter.post(
  "/admin/actions/setup",
  hmacCookieHandlers(true),
  authRoleMiddleware(),
  handlers.setupHandler
);
adminRouter.get(
  "/admin/actions/setup",
  hmacCookieHandlers(true),
  authRoleMiddleware(),
  handlers.setupPageHandler
);
adminRouter.get(
  "/admin/actions/login",
  hmacCookieHandlers,
  handlers.loginPageHandler
);
adminRouter.post(
  "/admin/actions/login",
  hmacCookieHandlers,
  handlers.loginAdminHandler
);

module.exports = adminRouter;
