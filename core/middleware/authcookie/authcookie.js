const jwt = require("jsonwebtoken");
const { appConfig } = require("../../../core/config");
const utils = require("../../../core/utils/error-handler");
const { HttpStatusCode } = require("../../../core/utils/HttpStatusCode");
const log = require("../../../core/utils/errorLogger");

exports.authCookie = async (req, res, next) => {
  if (!req.cookies.he && !req.cookies.pa && !req.cookies.si) {
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
    const jwtOptions = { algorithm: "ES256" };
    const decode = await jwt.verify(
      `${req.cookies.he}.${req.cookies.pa}.${req.cookies.si}`,
      appConfig.PUBKEY,
      jwtOptions
    );
    res.locals.user = decode.claim;
    next();
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
};
