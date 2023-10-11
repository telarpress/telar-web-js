const prod = require("../../../config/config.production.json");
const dev = require("../../../config/config.development.json");

const config = process.env.Node_ENV == "production" ? prod : dev;

exports.appConfig = {
  // BASE_ROUTE: config.micros.auth.environment.base_route,
  EXTERNAL_REDIRECT_DOMAIN:
    config.micros.auth.environment.external_redirect_domain,
  WEB_URL: config.micros.auth.environment.web_url,
  AUTH_WEB_URI: config.micros.auth.environment.auth_web_uri,
  GITHUB_CLIENT_ID: config.micros.auth.environment.github_client_id,
  // GITHUB_APP_ID: config.micros.auth.environment.github_app_id,
  // OAUTH_CLIENT_SECRET_PATH: config.micros.auth.environment.oauth_client_secret_path,
  // OAUTH_PROVIDER: config.micros.auth.environment.oauth_provider,
  // OAUTH_PROVIDER_BASE_URL: config.micros.auth.environment.oauth_provider_base_url,
  // OAUTH_TELAR_BASE_URL: config.micros.auth.environment.oauth_telar_base_url,
  GOOGLE_CLIENT_ID: config.micros.auth.environment.google_client_id,
  GOOGLE_CALLBACK_URL: config.micros.auth.environment.google_callback_url,
  // REPORT_STATUS: config.micros.auth.environment.report_status,
  VERIFY_TYPE: config.micros.auth.environment.verify_type,
  // WRITE_DEBUG: config.micros.auth.environment.write_debug,
  // EXEC_TIMEOUT: config.micros.auth.environment.exec_timeout,
  // READ_TIMEOUT: config.micros.auth.environment.read_timeout,
  // WRITE_TIMEOUT: config.micros.auth.environment.write_timeout,

  APP_NAME: config.environment.app_name,
  // BASE_ROUTE_DOMAIN:config.environment.base_route_domain,
  DB_TYPE: config.environment.db_type,
  HEADER_COOKIE_NAME: config.environment.header_cookie_name,
  ORG_AVATAR: config.environment.org_avatar,
  ORG_NAME: config.environment.org_name,
  PAYLOAD_COOKIE_NAME: config.environment.payload_cookie_name,
  // PHONE_SOURCE_NUMBER:config.environment.phone_source_number,
  // READ_TIMEOUT:config.environment.read_timeout,
  RECAPTCHA_SITE_KEY: config.environment.recaptcha_site_key,
  // REDIS_ADDRESS:config.environment.redis_address,
  REF_EMAIL: config.environment.ref_email,
  SIGNATURE_COOKIE_NAME: config.environment.signature_cookie_name,
  SMTP_EMAIL_HOST: config.environment.smtp_email_host,
  SMTP_EMAIL_PORT: config.environment.smtp_email_port,
  // WRITE_TIMEOUT:config.environment.write_timeout,
  COOKIE_ROOT_DOMAIN: config.environment.cookie_root_domain,
  // GATEWAY:config.environment.gateway,
  INTERNAL_GATEWAY: config.environment.internal_gateway,
  // ORIGIN:config.environment.origin,
  // WEBSOCKET_SERVER_URL: config.environment.websocket_server_url,
  // DEBUG:config.environment.debug,

  Node_ENV: process.env.Node_ENV,
  DB_URI: process.env.MONGO_HOST,
  RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY, //reCAPTCHA type:3 - for communication between your site and reCAPTCHA
  GITHUB_CLIENT_SECRET: process.env.GIT_CLIENT_SECRET,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  ACCESS_TPK: process.env.ACCESS_TOKEN_PRIVATE_KEY, //Short-lived (minutes) JWT Auth Token
  REFRESH_TPK: process.env.REFRESH_TOKEN_PRIVATE_KEY, //Longer-lived (hours/days) JWT Refresh Token
  KEY: decodeBase64(process.env.KEY),
  COOKIE_EXPIRY: process.env.COOKIE_EXPIRY,
  SALT: process.env.SALT,
  SMTP_EMAIL_USER: process.env.EMAIL_USER,
  SMTP_EMAIL_PASSWORD: process.env.EMAIL_PASS,
  SESSION_SECRET_KEY: process.env.SESSION_SECRET_KEY,
  HMAC_NAME: config.environment.hmac_header_name,
  HMAC_KEY: process.env.HMAC_KEY,
  ADMIN_USERNAME: process.env.ADMIN_USERNAME,
  ADMIN_PASSWORD: process.env.ADMIN_USERNAME,
};
// decodeBase64 Decode base64 string
function decodeBase64(encodedStrings) {
  // create a buffer
  const buff = Buffer.from(encodedStrings, "base64");
  // decode buffer as UTF-8
  const str = buff.toString("utf-8");
  // return normal string
  return str;
}
