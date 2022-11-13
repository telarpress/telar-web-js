const jwt = require("jsonwebtoken");
const { appConfig } = require("../config");
const log = require("../../../core/utils/errorLogger");

// createToken
exports.createToken = async function (tokenModel) {
  try {
    const privateKey = appConfig.KEY;
    const jwtOptions = {
      algorithm: "ES256",
      expiresIn: "48h",
    };
    const claims = {
      StandardClaims: {
        id: tokenModel.profile.id,
        issuer: `telar-social@${tokenModel.providerName}`,
        expiresAt: Math.floor(Date.now() * 86400),
        issuedAt: Math.floor(Date.now() / 1000),
        subject: tokenModel.profile.login,
        audience: appConfig.COOKIE_ROOT_DOMAIN,
      },
      organizations: tokenModel.organizationList,
      name: tokenModel.profile.name,
      accessToken: tokenModel.access_token,
      claim: tokenModel.claim,
    };
    const session = await jwt.sign(claims, privateKey, jwtOptions);
    return session;
  } catch (error) {
    log.Error(`unable to parse private key: ${error}`);
    return "", `unable to parse private key: ${error}`;
  }
};

// writeTokenOnCookie wite session on cookie
exports.writeSessionOnCookie = async function (res, session) {
  const parts = session.split(".");
  const cookieOptions = {
    httpOnly: true,
    path: "/",
    expires: new Date(Date.now() + Number(appConfig.COOKIE_EXPIRY)),
    domain: appConfig.COOKIE_ROOT_DOMAIN,
  };

  // Set cookies
  res.cookie(appConfig.HEADER_COOKIE_NAME, parts[0], cookieOptions); // headerCookie
  res.cookie(appConfig.PAYLOAD_COOKIE_NAME, parts[1], cookieOptions); // payloadCookie
  res.cookie(appConfig.SIGNATURE_COOKIE_NAME, parts[2], cookieOptions); // signCookie
};

// Write user language on cookie
exports.writeUserLangOnCookie = async function (res, lang) {
  // set langCookie cookie
  res.cookie("social-lang", lang, {
    httpOnly: false,
    path: "/",
    expires: new Date(Date.now() + Number(appConfig.COOKIE_EXPIRY)),
    domain: appConfig.COOKIE_ROOT_DOMAIN,
  });
};
