const prod = require("../../../config/config.production.json");
const dev = require("../../../config/config.development.json");

const config = process.env.Node_ENV == "production" ? prod : dev;

exports.appConfig = {
  // BASE_ROUTE: decodeBase64(config.micros.auth.environment.base_route),
  // EXTERNAL_REDIRECT_DOMAIN: decodeBase64(config.micros.auth.environment.external_redirect_domain),
  WEB_URL: decodeBase64(config.micros.auth.environment.web_url), //baseURL
  AUTH_WEB_URI: decodeBase64(config.micros.auth.environment.auth_web_uri), //authServiceURL
  CLIENT_ID: decodeBase64(config.micros.auth.environment.client_id), //clientID
  // CLIENT_SECRET: decodeBase64(config.micros.auth.environment.client_secret),
  // GITHUB_APP_ID: decodeBase64(config.micros.auth.environment.github_app_id),
  // OAUTH_CLIENT_SECRET_PATH: decodeBase64(config.micros.auth.environment.oauth_client_secret_path),
  // OAUTH_PROVIDER: decodeBase64(config.micros.auth.environment.oauth_provider),
  // OAUTH_PROVIDER_BASE_URL: decodeBase64(config.micros.auth.environment.oauth_provider_base_url),
  // OAUTH_TELAR_BASE_URL: decodeBase64(config.micros.auth.environment.oauth_telar_base_url),
  GOOGLE_CLIENT_ID: decodeBase64(
    config.micros.auth.environment.google_client_id
  ),
  GOOGLE_CALLBACK_URL: decodeBase64(
    config.micros.auth.environment.google_callback_url
  ),
  // REPORT_STATUS: decodeBase64(config.micros.auth.environment.report_status),
  VERIFY_TYPE: decodeBase64(config.micros.auth.environment.verify_type),
  // WRITE_DEBUG: decodeBase64(config.micros.auth.environment.write_debug),
  // EXEC_TIMEOUT: decodeBase64(config.micros.auth.environment.exec_timeout),
  // READ_TIMEOUT: decodeBase64(config.micros.auth.environment.read_timeout),
  // WRITE_TIMEOUT: decodeBase64(config.micros.auth.environment.write_timeout),

  APP_NAME: decodeBase64(config.environment.app_name), //AppName
  // BASE_ROUTE_DOMAIN:decodeBase64(config.environment.base_route_domain),
  DB_TYPE: decodeBase64(config.environment.db_type), //DB_TYPE:
  // HEADER_COOKIE_NAME:decodeBase64(config.environment.header_cookie_name),
  ORG_AVATAR: decodeBase64(config.environment.org_avatar), //OrgAvatar
  ORG_NAME: decodeBase64(config.environment.org_name), ///OrgName
  // PAYLOAD_COOKIE_NAME:decodeBase64(config.environment.payload_cookie_name),
  // PHONE_SOURCE_NUMBER:decodeBase64(config.environment.phone_source_number),
  // READ_TIMEOUT:decodeBase64(config.environment.read_timeout),
  RECAPTCHA_SITE_KEY: decodeBase64(config.environment.recaptcha_site_key), ///recaptchaSiteKey
  // REDIS_ADDRESS:decodeBase64(config.environment.redis_address),
  REF_EMAIL: decodeBase64(config.environment.ref_email), ////emailSender
  // SIGNATURE_COOKIE_NAME:decodeBase64(config.environment.signature_cookie_name),
  SMTP_EMAIL_HOST: decodeBase64(config.environment.smtp_email_host),
  SMTP_EMAIL_PORT: decodeBase64(config.environment.smtp_email_port),
  // WRITE_TIMEOUT:decodeBase64(config.environment.write_timeout),
  // COOKIE_ROOT_DOMAIN:decodeBase64(config.environment.cookie_root_domain),
  // GATEWAY:decodeBase64(config.environment.gateway),
  // INTERNAL_GATEWAY:decodeBase64(config.environment.internal_gateway),
  // ORIGIN:decodeBase64(config.environment.origin),
  // WEBSOCKET_SERVER_URL:decodeBase64(config.environment.websocket_server_url),
  // DEBUG:decodeBase64(config.environment.debug),

  ///// In .ENV File /////
  DB_URI: decodeBase64(process.env.mongo_host),
  recaptchaSecretKey: decodeBase64(process.env.recaptchaSecretKey), //reCAPTCHA type:decodeBase64(3 - for communication between your site and reCAPTCHA
  clientSecret: decodeBase64(process.env.GITclientSecret),
  accessTPK: decodeBase64(process.env.ACCESS_TOKEN_PRIVATE_KEY), //Short-lived (minutes) JWT Auth Token
  refreshTPK: decodeBase64(process.env.REFRESH_TOKEN_PRIVATE_KEY), //Longer-lived (hours/days) JWT Refresh Token
  SALT: decodeBase64(process.env.SALT),
  emailAddress: decodeBase64(process.env.EMAIL_USER),
  emailPassword: decodeBase64(process.env.EMAIL_PASS),
  verification_Address: decodeBase64(process.env.verification_Address),
  AppURL: decodeBase64(process.env.AppURL),
  Node_ENV: decodeBase64(process.env.Node_ENV),
  GOOGLE_CLIENT_SECRET: decodeBase64(process.env.GOOGLE_CLIENT_SECRET),
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
