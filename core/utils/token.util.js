// @ts-nocheck
const jwt = require("jsonwebtoken");

async function generateJWTToken(privateKeyData, claim, expireOffsetHour) {
  try {
    const token = jwt.sign({ claim }, privateKeyData, {
      algorithm: "ES256",
      expiresIn: expireOffsetHour * 3600,
    });
    return token;
  } catch (error) {
    throw new Error(`Error generating JWT token: ${error.message}`);
  }
}

async function validateToken(publicKeyData, token) {
  try {
    const decoded = jwt.verify(token, publicKeyData);
    return decoded.claim;
  } catch (error) {
    throw new Error(`Error validating JWT token: ${error.message}`);
  }
}

function isTokenExpired(token) {
  // Decode the token to get the expiration time
  const decodedToken = jwt.decode(token, { complete: true });

  // Check if the decoded token and its expiration time are valid
  if (decodedToken && decodedToken.payload.exp) {
    // Get the current time in seconds
    const currentTime = Math.floor(Date.now() / 1000);

    // Compare the expiration time with the current time
    return decodedToken.payload.exp < currentTime;
  } else {
    // Invalid token or missing expiration time
    return true;
  }
}

module.exports = {
  generateJWTToken,
  validateToken,
  isTokenExpired,
};
