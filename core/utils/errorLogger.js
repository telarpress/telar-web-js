const Error = (content, ...rest) => {
  console.error("[ERROR] ", content, ...rest);
};
const info = (content, ...rest) => {
  console.log("[Info] ", content, ...rest);
};
module.exports = { Error, info };
