exports.appConfig = {
  DB_URI: process.env.mongo_host,
  HMAC_SECRET_KEY: process.env.HMAC_SECRET_KEY,
  HMAC_HEADER_NAME: process.env.HMAC_HEADER_NAME,
  accessTPK: process.env.ACCESS_TOKEN_PRIVATE_KEY, //Short-lived (minutes) JWT Auth Token
};
