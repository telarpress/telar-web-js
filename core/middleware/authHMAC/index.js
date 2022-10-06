const { appConfig } = require("../../../micros/actions/config");
const utils = require("../../../core/utils/error-handler");
const { HttpStatusCode } = require("../../../core/utils/HttpStatusCode");
const log = require("../../../core/utils/errorLogger");
const { validate } = require("./authHMAC");
const { v4: uuidv4, v4 } = require("uuid");
exports.authHMAC = (req, res, next) => {
  try {
    // Check if the HMAC header contains content
    const headerName = appConfig.HMAC_NAME;
    const auth = req.get(headerName);

    if (auth.length < 1) {
      log.Error("Unauthorized! HMAC not presented!");
      return res
        .status(HttpStatusCode.Unauthorized)
        .send("Unauthorized! HMAC not presented!");
    }

    const validattion = validate(req.body, appConfig.HMAC_KEY, auth);
    if (validattion) {
      if (req.get("uid") === undefined) {
        log.Error(
          "[HMAC] User id is not provided. In this case user context will be set empty!"
        );
        res.locals.user = {};
        return next();
      }

      const userUUID = uuidv4();
      // const userUUID = uuid.FromString(req.body.uid);
      let createdDate = Math.floor(Date.now() / 1000);
      if (req.body.createdDate != "") {
        createdDate = parseInt(req.body.createdDate, 64);
      }

      res.locals.user = {
        userID: userUUID,
        username: req.header["email"],
        socialName: req.header["socialName"],
        displayName: req.header["displayName"],
        avatar: req.header["avatar"],
        banner: req.header["banner"],
        tagLine: req.header["tagLine"],
        createdDate: createdDate,
        systemRole: req.header["role"],
      };
      next();
    } else {
      log.Error("Can not parse UID from claim");
    }
  } catch (error) {
    log.Error(`HMAC validation ${error}`);
    // Authentication failed
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "authHMACMiddleware.AuthenticationFailed",
          "Authentication failed"
        ).json()
      );
  }
};
