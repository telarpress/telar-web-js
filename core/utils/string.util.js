const crypto = require("crypto");

async function hash(password) {
  try {
    const hashedPassword = await new Promise((resolve, reject) => {
      // Generate a random salt
      const salt = crypto.randomBytes(16).toString("hex");
      // Hash the password using SHA-256 algorithm with salt
      crypto.pbkdf2(password, salt, 10000, 64, "sha256", (err, derivedKey) => {
        if (err) {
          reject(err);
        } else {
          // Combine salt and derived key and return as hashed password
          resolve(salt + ":" + derivedKey.toString("hex"));
        }
      });
    });
    return hashedPassword;
  } catch (error) {
    // Handle error if occurred during hashing
    throw new Error(`Error in hashing password: ${error.message}`);
  }
}

async function compareHash(inputPassword, storedHashedPassword) {
  try {
    // Split the stored hashed password to get the salt and the derived key
    const [salt, key] = storedHashedPassword.split(":");

    // Hash the input password using the same salt
    const inputHashedPassword = await new Promise((resolve, reject) => {
      crypto.pbkdf2(
        inputPassword,
        salt,
        10000,
        64,
        "sha256",
        (err, derivedKey) => {
          if (err) {
            reject(err);
          } else {
            resolve(derivedKey.toString("hex"));
          }
        }
      );
    });

    // Compare the derived key of the input password with the stored derived key
    return inputHashedPassword === key;
  } catch (error) {
    // Handle error if occurred during comparison
    throw new Error(`Error in comparing password: ${error.message}`);
  }
}

function generateDigits(length) {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10); // Generate a random digit (0-9)
  }
  return result;
}

module.exports = {
  generateDigits,
  hash,
  compareHash,
};
