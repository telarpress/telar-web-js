const { appConfig } = require("../../../micros/actions/config");
const utils = require("../../../core/utils/error-handler");
const { HttpStatusCode } = require("../../../core/utils/HttpStatusCode");
const log = require("../../../core/utils/errorLogger");
const { sign } = require("./authHMAC");
const { v4: uuidv4, v4 } = require("uuid");
exports.authHMACMiddleware = (req, res, next) => {
  // Check if the HMAC header contains content
  const headerName = appConfig.HMAC_NAME;
  let auth = "";
  auth = req.header[headerName].toString();
  if (auth.length == 0) {
    log.Error("Unauthorized! HMAC not presented!");
    return res.status(HttpStatusCode.Unauthorized);
  }

  try {
    const signiture = sign(req.body, auth);
    if (signiture) {
      if (req.body.uid == "") {
        log.Error(
          "[HMAC] User id is not provided. In this case user context will be set empty!"
        );
        return next();
      }
      const userUUID = uuidv4();
      // const userUUID = uuid.FromString(req.body.uid);
      let createdDate = Math.floor(Date.now() / 1000);
      if (req.body.createdDate != "") {
        createdDate = strconv.ParseInt(req.body.createdDate, 10, 64);
      }
      let user = new UserSetting({
        userID: userUUID,
        username: req.body.email,
        socialName: req.body.socialName,
        displayName: req.body.displayName,
        avatar: req.body.avatar,
        banner: req.body.banner,
        tagLine: req.body.tagLine,
        createdDate: createdDate,
        systemRole: req.body.role,
      });

      return next();
    } else {
      log.Error("Can not parse UID from claim %s", userUuidErr.Error());
    }
  } catch (error) {
    log.Error("HMAC validation %s", err.Error());
  }
  // Authentication failed
  return res
    .status(HttpStatusCode.Unauthorized)
    .send(
      new utils.ErrorHandler(
        "authHMACMiddleware.AuthenticationFailed",
        "Authentication failed"
      ).json()
    );
};
