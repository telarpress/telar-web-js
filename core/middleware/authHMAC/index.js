const { appConfig } = require("../../config");
var CryptoJS = require("crypto-js");
const { HttpStatusCode } = require("../../utils/HttpStatusCode");
const utils = require("../../utils/error-handler");

// Define the headers to be included in HMAC calculation
const HMAC_HEADERS = [
  "content-type",
  "x-hmac-headers",
  "uid",
  "email",
  "socialname",
  "avatar",
  "displayname",
  "banner",
  "tagline",
  "role",
];

exports.authHMAC = function (req, res, next) {
  try {
    const hmacHeader = req.get(appConfig.HMAC_NAME);
    if (!hmacHeader) {
      return res.status(401).json({ error: "HMAC header is missing" });
    }

    const hmacHeaders = req.get("x-hmac-headers");

    if (!hmacHeaders) {
      return res.status(401).json({ error: "Missing X-HMAC-Headers header" });
    }

    const headersToSign = hmacHeaders.split(",");

    const [algorithm, signature] = hmacHeader.split("=");
    if (algorithm !== "sha256" || !signature) {
      return res.status(401).json({ error: "Invalid HMAC header format" });
    }

    // Reconstruct the string to sign
    const headersString = headersToSign
      .filter((key) => HMAC_HEADERS.includes(key.toLowerCase()))
      .map((header) => {
        const value = req.get(header);
        return value ? `${header.toLocaleLowerCase()}:${value}` : null;
      })
      .filter(Boolean)
      .join("\n");

    let body = "";
    if (req.method !== "GET" && req.body) {
      body = JSON.stringify(req.body);
    }
    const stringToSign = `${headersString}\n${body}`;

    // Calculate HMAC

    const digest = CryptoJS.HmacSHA256(
      stringToSign,
      appConfig.HMAC_KEY
    ).toString(CryptoJS.enc.Hex);

    console.log(`[${req.url}]`, appConfig.HMAC_KEY, digest, signature);
    if (digest !== signature) {
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
      console.warn(
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
    console.error(`HMAC validation ${error}`);
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
