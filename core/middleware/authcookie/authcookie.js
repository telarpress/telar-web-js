const jwt = require("jsonwebtoken");
const { appConfig } = require("../../../micros/actions/config");
const utils = require("../../../core/utils/error-handler");
const { HttpStatusCode } = require("../../../core/utils/HttpStatusCode");
const log = require("../../../core/utils/errorLogger");

exports.authCookieMiddleware = (req, res, next) => {

  if (!req.cookies.token) {
    log.Error("[authCookieMiddleware] Token is empty");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "authCookieMiddleware.invalidToken",
          "Token is empty"
        ).json()
      );
  }

  try {
    const decode = jwt.verify(req.cookies.token, appConfig.ACCESS_TPK);
    res.locals.user = { token: decode.id };
  } catch (error) {
    log.Error("[authCookieMiddleware] Can not verify current user" + error);
    return res
      .status(HttpStatusCode.Forbidden)
      .send(
        new utils.ErrorHandler(
          "authCookieMiddleware.invalidCurrentUser",
          "Can not verify current user"
        ).json()
      );
  }
  next();
};
