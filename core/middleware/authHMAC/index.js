const crypto = require("crypto");
const { appConfig } = require("../../config");
var CryptoJS = require("crypto-js");

// Define the headers to be included in HMAC calculation
const HMAC_HEADERS = [
  "content-type",
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

    const [algorithm, signature] = hmacHeader.split("=");
    if (algorithm !== "sha256" || !signature) {
      return res.status(401).json({ error: "Invalid HMAC header format" });
    }

    // Reconstruct the string to sign
    const headersString = HMAC_HEADERS.map((header) => {
      const value = req.get(header);
      return value ? `${header}:${value}` : null;
    })
      .filter(Boolean)
      .join("\n");

    let body = "";
    if (req.method !== "GET" && req.body) {
      body = JSON.stringify(req.body);
    }
    const stringToSign = `${headersString}\n${body}`;

    console.log("HMAC AFTER" + stringToSign + ";;;;;");
    // Calculate HMAC
    const hmac = crypto.createHmac("sha256", appConfig.HMAC_KEY);
    hmac.update(stringToSign);
    const calculatedSignature = hmac.digest("hex");

    console.log(calculatedSignature);
    console.log(signature);

    const digest = CryptoJS.HmacSHA256(
      headersString,
      appConfig.HMAC_KEY
    ).toString(CryptoJS.enc.Hex);

    const hmacHeader2 = `sha256=${digest}`;

    console.log(hmacHeader2);
    if (calculatedSignature !== signature) {
      return res.status(401).json({ error: "HMAC signature is invalid" });
    }

    next();
  } catch (error) {
    console.error("Error in HMAC authentication:", error);
    res
      .status(500)
      .json({ error: "Internal server error during HMAC authentication" });
  }
};

// module.exports = authHMAC;

// exports.authHMAC = function (req, res, next) {
//   try {
//     const expectedHmac = `sha256=${CryptoJS.HmacSHA256(
//       JSON.stringify(req.body),
//       payloadSecret
//     ).toString(CryptoJS.enc.Hex)}`;
//     console.log("expectedHmac ", expectedHmac);
//     if (auth !== expectedHmac) {
//       log.Error("Cannot validate HMAC");
//       return res
//         .status(HttpStatusCode.Unauthorized)
//         .json(
//           new utils.ErrorHandler(
//             "authHMACMiddleware.HMACValidationTampered",
//             "HMAC has been tampered"
//           ).json()
//         );
//     }

//     if (!req.get("uid")) {
//       log.Error(
//         "[HMAC] User ID is not provided. In this case user context will be set empty!"
//       );
//       res.locals.user = {};
//       return next();
//     }

//     const userUUID = req.get("uid");
//     let createdDate = Math.floor(Date.now() / 1000);
//     if (req.body.createdDate) {
//       createdDate = parseInt(req.body.createdDate, 10);
//     }

//     res.locals.user = {
//       uid: userUUID,
//       userId: userUUID,
//       username: req.get("email"),
//       socialName: req.get("socialName"),
//       displayName: req.get("displayName"),
//       avatar: req.get("avatar"),
//       banner: req.get("banner"),
//       tagLine: req.get("tagLine"),
//       createdDate,
//       systemRole: req.get("role"),
//     };

//     next();
//   } catch (error) {
//     log.Error(`HMAC validation ${error}`);
//     return res
//       .status(HttpStatusCode.Unauthorized)
//       .json(
//         new utils.ErrorHandler(
//           "authHMACMiddleware.AuthenticationFailed",
//           "Authentication failed"
//         ).json()
//       );
//   }
// };
