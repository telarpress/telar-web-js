const express = require("express");
const storageRouter = express.Router();
const { appConfig } = require("../config");
const { upload } = require("../utils/uploadToCloudinary");
const {
  authCookie,
} = require("../../../core/middleware/authcookie/authcookie");

const { authHMAC } = require("../../../core/middleware/authHMAC/");

const hmacCookieHandlers = (hmacWithCookie) => (req, res, next) => {
  if (req.get(appConfig.HMAC_NAME) !== undefined || !hmacWithCookie) {
    return authHMAC(req, res, next);
  }
  return authCookie(req, res, next);
};
const handlers = require("../handlers");

// Router
storageRouter.post(
  "/storage/:uid/:dir",
  hmacCookieHandlers(true),
  upload.single("file"),
  handlers.uploadeHandle
  // handlers.check
  // handlers.uploadeHandle
);
storageRouter.get(
  "/storage/:uid/:dir/:name",
  hmacCookieHandlers(false),
  handlers.getFileHandle
);

module.exports = storageRouter;
