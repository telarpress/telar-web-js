const prod = require("../../../config/config.production.json");
const dev = require("../../../config/config.development.json");

const config = process.env.Node_ENV == "production" ? prod : dev;

exports.appConfig = {
  DB_URI: decodeBase64(process.env.mongo_host),
  HMAC_SECRET_KEY: decodeBase64(process.env.HMAC_SECRET_KEY),
  HMAC_HEADER_NAME: decodeBase64(process.env.HMAC_HEADER_NAME),
  ACCESS_TPK: decodeBase64(process.env.ACCESS_TOKEN_PRIVATE_KEY),
};

// decodeBase64 Decode base64 string
function decodeBase64(encodedStrings) {
  return encodedStrings;
  // After creating the env file based on Base64 encryption, apply the following changes.
  // // create a buffer
  // const buff = Buffer.from(encodedStrings, "base64");
  // // decode buffer as UTF-8
  // const str = buff.toString("utf-8");
  // // return normal string
  // return str;
}
