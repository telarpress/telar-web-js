const { appConfig } = require("../config");
const { default: axios } = require("axios");
const GateKeeper = require("../utils/hmac");

// microCall send request to another function/microservice using cookie validation
/**
 *
 * @param {'get' | 'GET'
  | 'delete' | 'DELETE'
  | 'head' | 'HEAD'
  | 'options' | 'OPTIONS'
  | 'post' | 'POST'
  | 'put' | 'PUT'
  | 'patch' | 'PATCH'
  | 'purge' | 'PURGE'
  | 'link' | 'LINK'
  | 'unlink' | 'UNLINK'} method
 * @param {*} data
 * @param {string} url
 * @param {*} headers
 */
exports.microCall = async (method, data, url, headers = {}) => {
  try {
    const digest = GateKeeper.sign(JSON.stringify(data), process.env.HMAC_KEY);
    headers["Content-type"] = "application/json;charset=UTF-8";
    headers[appConfig.HMAC_NAME] = digest;

    console.log(`\ndigest: ${digest}, header: ${appConfig.HMAC_NAME} \n`);

    if (!headers) {
      for (let k = 0; k < headers.length; k++) {
        for (let v = 0; v < headers.length; v++) {
          axiosConfig.headers[headers[k]] = headers[v];
        }
      }
    }
    //  url: appConfig.InternalGateway + url,
    const result = await axios({
      method: method,
      data,
      url: "http://localhost" + url,
      headers,
    });
    return result.data;
  } catch (error) {
    // handle axios error and throw correct error
    // https://github.com/axios/axios#handling-errors
    console.log(
      `Error while sending admin check request!: callAPIWithHMAC ${url}` + error
    );
    return Error(
      "Error while sending admin check request!: admin/callAPIWithHMAC" + error
    );
  }
};

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
