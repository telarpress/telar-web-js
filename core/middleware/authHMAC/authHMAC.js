/**
 * Reference https://github.com/cabrerabywaters/faas-node-gatekeeper/blob/master/index.js
 */

const crypto = require("crypto");

const sign = (data, sharedSecret) => {
  const hash = crypto
    .createHmac("sha1", sharedSecret)
    .update(data, "utf8")
    .digest("hex");

  return "sha1=" + hash;
};

/**
 * Removes 'sha1=' from hash string
 * @param {String} hash
 */
const getHashedMessage = (hash) => {
  if (!hash) {
    throw new Error(
      "We could not get the HASH from your message. Did you sign it? (--sign)"
    );
  }

  if (hash.includes("sha1=")) {
    hash = hash.replace("sha1=", "");
  }
  return hash;
};

/**
 * Verifies that the message was hashed with
 * the proper shared key
 *
 * @param {String} hashedMessage
 * @param {String} sharedSecret
 * @param {String} message
 */
const verify = (hashedMessage, sharedSecret, message) => {
  const expectedHash = crypto
    .createHmac("sha1", sharedSecret)
    .update(message, "utf8")
    .digest("hex");
  return hashedMessage === expectedHash;
};

/**
 *  Pulls the Hash and Secret assuming you are
 *  running the function with OpenFaaS,
 *  and verifies the message
 *
 * @param {String} message Original message, without hashing
 * @param {String} secret Name of the secret to  generate
 *                        the Hash
 */
const validate = async (message, secret, hash) => {
  const hashedMessage = getHashedMessage(hash);
  return verify(hashedMessage, secret, message);
};

module.exports = { validate, verify, sign };
