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
  BUCKET_NAME: config.micros.storage.environment.bucket_name,
  BASEROUTE: config.micros.storage.environment.base_route,
  REDIS_PWD: process.env.REDIS_PWD,
  STORAGE_SECRET: process.env.STORAGE_SECRET,
  REDIS_ADDRESS: config.environment.redis_address,
 
  
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
