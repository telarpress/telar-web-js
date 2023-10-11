const jwt = require("jsonwebtoken");
const { appConfig } = require("../../../core/config");
const utils = require("../../../core/utils/error-handler");
const { HttpStatusCode } = require("../../../core/utils/HttpStatusCode");
const log = require("../../../core/utils/errorLogger");

exports.authrole = async (req, res, next) => {
  if (!res.locals.user) {
    // Authentication failed
    log.Error("authRoleMiddleware: authRoleMiddleware Problem");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "authRoleMiddleware.missingAuthRoleMiddleware",
          "Missing auth Role Middleware"
        ).json()
      );
  }
  // Get current user
  const currentUser = res.locals.user;
  if (currentUser.role[0] == "admin") {
    let canAccess = true;
    return next();
  }
  log.Error("authRoleMiddleware: authRole Problem");
  return res
    .status(HttpStatusCode.Unauthorized)
    .send(
      new utils.ErrorHandler(
        "authRoleMiddleware.missingAuthRole",
        "Can not verify current user"
      ).json()
    );
};
