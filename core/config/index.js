const prod = require("../../config/config.production.json");
const dev = require("../../config/config.development.json");

const config = process.env.Node_ENV == "production" ? prod : dev;

exports.appConfig = {
  HMAC_NAME: config.environment.hmac_header_name,
  HMAC_KEY: process.env.HMAC_KEY,
  PUBKEY: decodeBase64(process.env.PUBKEY),
};

// decodeBase64 Decode base64 string
function decodeBase64(encodedStrings) {
  //After creating the env file based on Base64 encryption, apply the following changes.
  // create a buffer
  const buff = Buffer.from(encodedStrings, "base64");
  // decode buffer as UTF-8
  const str = buff.toString("utf-8");
  // return normal string
  return str;
}
