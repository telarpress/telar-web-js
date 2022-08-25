exports.appConfig = {
  DB_URI: decodeBase64(process.env.mongo_host),
  DB_TYPE: decodeBase64(process.env.DB_TYPE),
  recaptchaSiteKey: decodeBase64(process.env.recaptchaSiteKey), //reCAPTCHA type:decodeBase64(3 - in the HTML code your site serves to users
  recaptchaSecretKey: decodeBase64(process.env.recaptchaSecretKey), //reCAPTCHA type:decodeBase64(3 - for communication between your site and reCAPTCHA
  clientID: decodeBase64(process.env.GITclientID),
  clientSecret: decodeBase64(process.env.GITclientSecret),
  accessTPK: decodeBase64(process.env.ACCESS_TOKEN_PRIVATE_KEY), //Short-lived (minutes) JWT Auth Token
  refreshTPK: decodeBase64(process.env.REFRESH_TOKEN_PRIVATE_KEY), //Longer-lived (hours/days) JWT Refresh Token
  SALT: decodeBase64(process.env.SALT),
  emailCenter: decodeBase64(process.env.EMAIL_HOST),
  emailPort: decodeBase64(process.env.EMAIL_PORT),
  emailAddress: decodeBase64(process.env.EMAIL_USER),
  emailPassword: decodeBase64(process.env.EMAIL_PASS),
  emailSender: decodeBase64(process.env.EMAIL_SENDER),
  baseURL: decodeBase64(process.env.BASE_URL),
  authServiceURL: decodeBase64(process.env.Auth_Service_URL),
  verification_Address: decodeBase64(process.env.verification_Address),
  AppURL: decodeBase64(process.env.AppURL),
  AppName: decodeBase64(process.env.AppName),
  OrgAvatar: decodeBase64(process.env.OrgAvatar),
  OrgName: decodeBase64(process.env.OrgName),
  Node_ENV: decodeBase64(process.env.Node_ENV),
  VerifyType: decodeBase64(process.env.VerifyType),
  GOOGLE_CLIENT_ID: decodeBase64(process.env.GOOGLE_CLIENT_ID),
  GOOGLE_CLIENT_SECRET: decodeBase64(process.env.GOOGLE_CLIENT_SECRET),
  GOOGLE_CALLBACK_URL: decodeBase64(process.env.GOOGLE_CALLBACK_URL),
  SESSION_SECRET_KEY: decodeBase64(process.env.SESSION_SECRET_KEY),
  HMAC_SECRET_KEY: decodeBase64(process.env.HMAC_SECRET_KEY),
  HMAC_HEADER_NAME: decodeBase64(process.env.HMAC_HEADER_NAME),
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
