// @ts-nocheck
var CryptoJS = require("crypto-js");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios").default;
const { appConfig } = require("../config");
const { retry } = require("../../../core/utils/http.util");
const { isValidJsonObject } = require("../../../core/utils/object.util");

function generateRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSocialName(name, uid) {
  const sanitizedName = name.replace(/\s+/g, ""); // Remove whitespace from name
  const userIdPart = uid.split("-")[0]; // Get the first part of the UID
  const socialName = sanitizedName.toLowerCase() + userIdPart;
  return socialName;
}

// Utility function to get pretty URL
function getPrettyURLf(url) {
  // Implement this function based on your application config
  return `${appConfig.BASE_ROUTE}${url}`;
}

// Allowed HTTP methods
const allowedMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"];

// functionCall sends a request to another function/microservice using cookie validation
async function functionCall(method, payload, url, header) {
  try {
    if (!isValidJsonObject(payload)) {
      throw new Error("Invalid payload. The payload must be a JSON object.");
    }

    // Validate HTTP method
    if (!allowedMethods.includes(method.toUpperCase())) {
      throw new Error("Invalid HTTP method");
    }

    // Construct the full URL for the request
    const prettyURL = getPrettyURLf(url);
    const requestURL = `${appConfig.INTERNAL_GATEWAY}${prettyURL}`;

    // HMAC signing
    const payloadSecret = appConfig.HMAC_KEY;

    const digest = CryptoJS.HmacSHA256(
      JSON.stringify(payload),
      payloadSecret
    ).toString(CryptoJS.enc.Hex);
    const hmacHeader = `sha256=${digest}`;

    // Set up headers
    const headers = {
      "Content-type": "application/json",
      [appConfig.HMAC_NAME]: hmacHeader,
    };

    if (header) {
      Object.keys(header).forEach((key) => {
        headers[key] = header[key];
      });
    }

    // Send the HTTP request with timeout and retry logic
    // Define the function to be retried
    const sendRequest = async () => {
      const response = await axios({
        method,
        baseURL: appConfig.INTERNAL_GATEWAY,
        url: requestURL,
        data: payload,
        headers,
        timeout: 5000, // Set a reasonable timeout (e.g., 5 seconds)
      });

      if (response.status === 200 || response.status === 202) {
        return response.data;
      }

      throw new Error(`Request failed with status code ${response.status}`);
    };

    // Retry logic
    return await retry(sendRequest, 3, 1000); // 3 retries, 1 second delay
  } catch (error) {
    console.error(`Error while sending request: ${error.message}`);
    throw new Error(`Error while sending request: ${error.message}`);
  }
}

async function initUserSetup(userId, email, avatar, displayName, role) {
  try {
    // Create admin header for HTTP request
    const adminHeaders = {
      uid: userId,
      email: email,
      avatar: avatar,
      displayName: displayName,
      role: role,
    };

    const circleURL = `/circles/following/${userId}`;
    await functionCall("POST", {}, circleURL, adminHeaders);

    // Create default setting for user
    const settingModel = {
      list: [
        {
          type: "notification",
          list: [
            { name: "send_email_on_like", value: "false" },
            { name: "send_email_on_follow", value: "false" },
            { name: "send_email_on_comment_post", value: "false" },
            { name: "send_email_app_news", value: "true" },
          ],
        },
        {
          type: "lang",
          list: [{ name: "current", value: "en" }],
        },
      ],
    };

    // Send request for setting
    const settingURL = "/setting";
    await functionCall("POST", settingModel, settingURL, adminHeaders);

    // Generate private and access keys
    const privateKey = uuidv4();
    const accessKey = uuidv4();

    // Send request for action room
    const actionRoomModel = {
      ownerUserId: userId,
      privateKey: privateKey,
      accessKey: accessKey,
    };

    const actionRoomURL = "/actions/room";
    await functionCall("POST", actionRoomModel, actionRoomURL, adminHeaders);

    return null; // Success
  } catch (error) {
    return error;
  }
}

function getURLSchemaHost(s) {
  try {
    const parsedUrl = new url.URL(s);
    return `${parsedUrl.protocol}//${parsedUrl.host}`;
  } catch (err) {
    throw new Error(`Invalid URL: ${s}`);
  }
}

module.exports = {
  generateRandomNumber,
  generateSocialName,
  functionCall,
  initUserSetup,
  getURLSchemaHost,
};
