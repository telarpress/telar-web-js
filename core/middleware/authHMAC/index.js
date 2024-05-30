var CryptoJS = require("crypto-js");
const { appConfig } = require("../../config");
const utils = require("../../../core/utils/error-handler");
const { HttpStatusCode } = require("../../../core/utils/HttpStatusCode");
const log = require("../../../core/utils/errorLogger");

exports.authHMAC = (req, res, next) => {
  try {
    const headerName = appConfig.HMAC_NAME;
    const auth = req.get(headerName);
    if (!auth) {
      log.Error("Unauthorized! HMAC not presented!");
      return res
        .status(HttpStatusCode.Unauthorized)
        .send("Unauthorized! HMAC not presented!");
    }

    const payloadSecret = appConfig.HMAC_KEY;
    if (!payloadSecret) {
      log.Error("HMAC private key os not presented!");
      return res
        .status(HttpStatusCode.InternalServerError)
        .json(
          new utils.ErrorHandler(
            "authHMACMiddleware.HMACValidationTampered",
            "Internal server error"
          ).json()
        );
    }
    console.log("auth ", auth);
    console.log("secret ,eq.body", payloadSecret, JSON.stringify(req.body));
    const expectedHmac = `sha256=${CryptoJS.HmacSHA256(
      JSON.stringify(req.body),
      payloadSecret
    ).toString(CryptoJS.enc.Hex)}`;
    console.log("expectedHmac ", expectedHmac);
    if (auth !== expectedHmac) {
      log.Error("Cannot validate HMAC");
      return res
        .status(HttpStatusCode.Unauthorized)
        .json(
          new utils.ErrorHandler(
            "authHMACMiddleware.HMACValidationTampered",
            "HMAC has been tampered"
          ).json()
        );
    }

    if (!req.get("uid")) {
      log.Error(
        "[HMAC] User ID is not provided. In this case user context will be set empty!"
      );
      res.locals.user = {};
      return next();
    }

    const userUUID = req.get("uid");
    let createdDate = Math.floor(Date.now() / 1000);
    if (req.body.createdDate) {
      createdDate = parseInt(req.body.createdDate, 10);
    }

    res.locals.user = {
      uid: userUUID,
      userId: userUUID,
      username: req.get("email"),
      socialName: req.get("socialName"),
      displayName: req.get("displayName"),
      avatar: req.get("avatar"),
      banner: req.get("banner"),
      tagLine: req.get("tagLine"),
      createdDate,
      systemRole: req.get("role"),
    };

    next();
  } catch (error) {
    log.Error(`HMAC validation ${error}`);
    return res
      .status(HttpStatusCode.Unauthorized)
      .json(
        new utils.ErrorHandler(
          "authHMACMiddleware.AuthenticationFailed",
          "Authentication failed"
        ).json()
      );
  }
};
