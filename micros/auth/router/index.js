const express = require("express");
const authRouter = express.Router();
require("../utils/googleOauth");

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
authRouter.get("/auth/admin/check", handlers.checkAdminHandler);
// authRouter.post("auth/admin/signup", handlers.adminSignupHandle);
// authRouter.post("auth/admin/login", handlers.loginAdminHandler);

// Signup
authRouter.get("/auth/signup", handlers.signupPageHandler);
authRouter.post("/auth/signup", handlers.signupTokenHandle);

authRouter.get("/auth/signup/verify", handlers.verifyGetSignupHandle);
authRouter.post("/auth/signup/verify", handlers.verifySignupHandle);

// Password
authRouter.get("/auth/password/reset", handlers.getResetUserPassword);
authRouter.post("/auth/password/reset", handlers.resetUserPassword);

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

authRouter.post("/auth/password/change", handlers.changePasswordHandler);

// Login
authRouter.get("/auth/", handlers.mainPageHandler);
authRouter.get("/auth/login/", handlers.loginPageHandler);
// authRouter.post("/auth/", handlers.loginTelarHandler);
authRouter.post("/auth/login/", handlers.loginTelarHandler);
authRouter.post("/auth/login/telar", handlers.loginTelarHandler);

// login.Get("/github", handlers.LoginGithubHandler)
// login.Get("/google", handlers.LoginGoogleHandler)
// app.Get("/oauth2/authorized", handlers.OAuth2Handler)

authRouter.get("/auth/github/callback", handlers.gitCallback);
authRouter.get("/auth/gitsuccess", handlers.gitSuccess);

authRouter.get("/auth/logout", handlers.logout);
authRouter.get("/auth/getUsers", handlers.getUsers);
authRouter.get("/auth/getTokens", handlers.getTokens);

// Profile
// authRouter.Put("/auth/profile", handlers.UpdateProfileHandle);

module.exports = authRouter;
