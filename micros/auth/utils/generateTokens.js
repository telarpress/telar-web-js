const jwt = require("jsonwebtoken");
const { UserAuth } = require("../models/user");
const { appConfig } = require("../config");

exports.accessToken = async function (user) {
  const payload = { id: user.objectId, roles: user.role };
  const jwtToken = jwt.sign(payload, appConfig.accessTPK, {
    expiresIn: "14m",
  });
  return jwtToken;
};

exports.refreshToken = async function (user) {
  const payload = { id: user.objectId, roles: user.role };
  const refreshToken = jwt.sign(payload, appConfig.refreshTPK, {
    expiresIn: "30d",
  });
  return await UserAuth.updateOne(
    { objectId: user.objectId },
    { access_token: refreshToken }
  );
};

// add Counter And Last Update
exports.addCounterAndLastUpdate = async (objectId) => {
  return await UserAuth.findOneAndUpdate({ objectId }, {});
};
