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

//return a token to verify user signup process
authRouter.post("/auth/signup", handlers.signupTokenHandle);

// handler verify the signup token to register user
authRouter.post("/auth/signup/verify", handlers.verifySignupHandle);

//change user password
authRouter.post(
  "/auth/password/change",
  hmacCookieHandlers(true),
  handlers.changePasswordHandler
);

authRouter.get("/auth/password/forget", handlers.getForgetPasswordPage);
authRouter.post("/auth/password/forget", handlers.forgetPassword);
authRouter.get(
  "/auth/password/reset/:userId/:token",
  handlers.getResetUserPassword
);
authRouter.post(
  "/auth/password/reset/:userId/:token",
  handlers.getResetPassword
);

// //return forget password page
// authRouter.get("/auth/password/forget", handlers.forgetPasswordPageHandler);

// //send forget password link to the user email
// authRouter.post("/auth/password/forget", handlers.forgetPasswordCodeHandler);

// authRouter.get(
//   "/auth/password/forgetwithcode",
//   handlers.forgetPasswordWithCodePageHandler
// );

// authRouter.post(
//   "/auth/password/forgetwithcode",
//   handlers.forgetPasswordwithCodeFormHandler
// );

//return reset password page
// /password/reset/{verifyId}
// /password/reset/{verifyId}

//get a password from user and set as a new password
// authRouter.post("/auth/password/reset/:verifyId", handlers.resetUserPassword);

//signup the admin user and return access token
authRouter.post("/auth/admin/signup", handlers.adminSignupHandle);
//Logs in an admin user to the telar social platform
authRouter.post("/auth/admin/login", handlers.loginAdminHandler);

//handler to check whether admin user registered
authRouter.post(
  "/auth/admin/check",
  hmacCookieHandlers(false),
  handlers.checkAdminHandler
);

// Authenticates a user with Telar Social credentials for Single Page Applications
authRouter.post("/auth/login/telar/spa", handlers.loginTelarHandler);
authRouter.get("/auth/login/", handlers.loginPageHandler);
// authRouter.post("/auth/", handlers.loginTelarHandler);
authRouter.post("/auth/login/", handlers.loginTelarHandler);

//Redirects the user to GitHub for authentication
authRouter.get("/auth/github", handlers.loginGithubHandler);
authRouter.get("/auth/github/callback", handlers.loginGithubCallbackHandler); //////// Need SEt API
authRouter.get("/auth/gitsuccess", handlers.loginGithubSuccessHandler); //////// Need SEt API

//Redirects the user to Google for authentication
authRouter.get("/auth/google", handlers.loginGoogleHandler);
authRouter.get("/auth/google/callback", handlers.loginGoogleCallbackHandler); //////// Need SEt API

//auth
//GET
//Login page
//Renders the login page for Telar Social
authRouter.get("/auth/", handlers.mainPageHandler); /////////////

//Authenticates a user with Telar Social credentials
authRouter.post("/auth/", handlers.loginTelarHandler); ///////////////////

//default

// return signup page in HTML
// /admin/signup   //////// Need API

authRouter.get("/auth/signup", handlers.signupPageHandler); //////// Need SEt API

authRouter.get("/auth/signup/verify", handlers.verifyGetSignupHandle); //////// Need SEt API

//Verifies the signup process by validating the token and saving user data

// authRouter.get(
//   "/auth/password/reset",
//   hmacCookieHandlers(true),
//   handlers.getResetUserPassword
// );
// authRouter.post(
//   "/auth/password/reset",
//   hmacCookieHandlers(true),
//   handlers.resetUserPassword
// );

authRouter.get("/auth/logout", handlers.logout);
authRouter.get("/auth/getUsers", handlers.getUsers);
authRouter.get("/auth/getTokens", handlers.getTokens);

module.exports = authRouter;
