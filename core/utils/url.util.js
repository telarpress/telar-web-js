const { appConfig } = require("../config");

// GetPrettyURL returns appConfig.BaseRoute
function getPrettyURL() {
  return appConfig.BaseRoute;
}

// GetPrettyURLf formats according to pretty URL from (baseFunctionURL+url) and returns the resulting string.
function getPrettyURLf(url) {
  return `${appConfig.BaseRoute}${url}`;
}

module.exports = {
  getPrettyURL,
  getPrettyURLf,
};
