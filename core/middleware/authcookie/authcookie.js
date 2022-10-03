const jwt = require("jsonwebtoken");
const { appConfig } = require("../../../micros/actions/config");
const utils = require("../../../core/utils/error-handler");
const { HttpStatusCode } = require("../../../core/utils/HttpStatusCode");
const log = require("../../../core/utils/errorLogger");

exports.authMiddleware = (req, res, next) => {

  if (!req.cookies.token) {
    log.Error("[authMiddleware] Can not get current user");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "authMiddleware.invalidCurrentUser",
          "Can not get current user"
        ).json()
      );
  }

  try {
    const decode = jwt.verify(req.cookies.token, appConfig.ACCESS_TPK);
    res.locals.user = { token: decode.id };
  } catch (error) {
    log.Error("[authMiddleware] Can not verify current user" + error);
    return res
      .status(HttpStatusCode.Forbidden)
      .send(
        new utils.ErrorHandler(
          "authMiddleware.invalidCurrentUser",
          "Can not verify current user"
        ).json()
      );
  }
  next();
};
