const express = require("express");
const authRouter = express.Router();
require("../utils/googleOauth");
const { appConfig } = require("../config");
const {
  authCookie,
} = require("../../../core/middleware/authcookie/authcookie");

const { authHMAC } = require("../../../core/middleware/authHMAC/");
const { authrole } = require("../../../core/middleware/authrole/");
const hmacCookieHandlers = (hmacWithCookie) => (req, res, next) => {
  if (req.get(appConfig.HMAC_NAME) !== undefined || !hmacWithCookie) {
    return authHMAC(req, res, next);
  }
  return authCookie(req, res, next);
};

const authRoleMiddleware = () => (req, res, next) => {
  return authrole(req, res, next);
};

// @title Auth micro API
// @version 1.0
// @description This is an API to authenticate users
// @termsOfService http://swagger.io/terms/
// @contact.name API Support
// @contact.email dev@telar.dev
// @license.name MIT
// @license.url https://github.com/telarpress/telar-web-js/blob/master/LICENSE
// @host social.telar.dev
// @BasePath /
const handlers = require("../handlers");

// Swagger
// authRouter.get("/swagger/*", swagger.HandlerDefault);

//Admin
authRouter.post(
  "/auth/check/admin",
  hmacCookieHandlers(false),
  handlers.checkAdminHandler
);
authRouter.post("/auth/signup/admin", handlers.adminSignupHandle);
authRouter.post("/auth/login/admin", handlers.loginAdminHandler);

// Signup
authRouter.get("/auth/signup", handlers.signupPageHandler);
authRouter.post("/auth/signup", handlers.signupTokenHandle);

authRouter.get("/auth/signup/verify", handlers.verifyGetSignupHandle);
authRouter.post("/auth/signup/verify", handlers.verifySignupHandle);

// Password
authRouter.get(
  "/auth/password/reset",
  hmacCookieHandlers(true),
  handlers.getResetUserPassword
);
authRouter.post(
  "/auth/password/reset",
  hmacCookieHandlers(true),
  handlers.resetUserPassword
);

// authRouter.get("/auth/password/reset/:verifyId", handlers.getResetUserPassword);
// authRouter.post("/auth/password/reset/:verifyId", handlers.resetUserPassword);

authRouter.get("/auth/password/forget", handlers.forgetPasswordPageHandler);
authRouter.post("/auth/password/forget", handlers.forgetPasswordCodeHandler);
authRouter.get(
  "/auth/password/forgetwithcode",
  handlers.forgetPasswordWithCodePageHandler
);

authRouter.post(
  "/auth/password/forgetwithcode",
  handlers.forgetPasswordwithCodeFormHandler
);

authRouter.get("/auth/password/forgetbyemail", handlers.getForgetPasswordPage);
authRouter.post("/auth/password/forgetbyemail", handlers.forgetPassword);
authRouter.get(
  "/auth/password/forgetbyemail/:userId/:token",
  handlers.getForgetPassword
);

authRouter.post(
  "/auth/password/change",
  hmacCookieHandlers(true),
  handlers.changePasswordHandler
);

// Login
authRouter.get("/auth/", handlers.mainPageHandler);
authRouter.get("/auth/login/", handlers.loginPageHandler);
// authRouter.post("/auth/", handlers.loginTelarHandler);
authRouter.post("/auth/login/", handlers.loginTelarHandler);
authRouter.post("/auth/login/telar", handlers.loginTelarHandler);

authRouter.get("/auth/github", handlers.loginGithubHandler);
authRouter.get("/auth/github/callback", handlers.loginGithubCallbackHandler);
authRouter.get("/auth/gitsuccess", handlers.loginGithubSuccessHandler);

authRouter.get("/auth/google", handlers.loginGoogleHandler);
authRouter.get("/auth/google/callback", handlers.loginGoogleCallbackHandler);

authRouter.get("/auth/logout", handlers.logout);
authRouter.get("/auth/getUsers", handlers.getUsers);
authRouter.get("/auth/getTokens", handlers.getTokens);

module.exports = authRouter;
