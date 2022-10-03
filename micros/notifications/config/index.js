const prod = require("../../../config/config.production.json");
const dev = require("../../../config/config.development.json");

const config = process.env.Node_ENV == "production" ? prod : dev;

exports.appConfig = {
  DB_TYPE: config.environment.db_type,
  DB_URI: process.env.MONGO_HOST,
  ACCESS_TPK: process.env.ACCESS_TOKEN_PRIVATE_KEY,
  WEBSOCKET_SERVER_URL: config.environment.websocket_server_url,
  GATEWAY: config.environment.gateway,
  HMAC_NAME: config.environment.hmac_header_name,
  HMAC_KEY: process.env.HMAC_KEY,
  AppName: config.environment.app_name,
  WebURL: config.micros.notification.environment.web_url,
  SMTP_EMAIL_HOST: config.environment.smtp_email_host,
  SMTP_EMAIL_PORT: config.environment.smtp_email_port,
  SMTP_EMAIL_USER: process.env.EMAIL_USER,
  SMTP_EMAIL_PASSWORD: process.env.EMAIL_PASS,
  REF_EMAIL: config.environment.ref_email,
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
