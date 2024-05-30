function isValidJsonObject(arg) {
  if (
    arg === null ||
    typeof arg !== "object" ||
    Array.isArray(arg) ||
    arg instanceof Date
  ) {
    return false;
  }

  try {
    // Ensure that the object does not have any values that cannot be serialized to JSON
    JSON.stringify(arg);
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = {
  isValidJsonObject,
};
