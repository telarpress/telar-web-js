const jwt = require("jsonwebtoken");
const { appConfig } = require("../../../micros/actions/config");

exports.authMiddleware = (req, res, next) => {
  if (!req.cookies.token && jwt.verify(req.cookies.token)) {
    log.Error("[SetAccessKeyHandle] Can not get current user");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "actionRoom.invalidCurrentUser",
          "Can not get current user"
        ).json()
      );
  }

  const token = req.cookies.token;
  const decode = jwt.verify(token, appConfig.ACCESS_TPK);
  res.locals.user = { token: decode.id };
  next();
};
