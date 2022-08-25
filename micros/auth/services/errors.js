module.exports = (err, req, res, next) => {
  err.message = err.message || "Internal Server";
  err.code = err.code || "internalServer";
  res.json({
    error: { code: err.code, message: err.message },
  });
};
