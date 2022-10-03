class ErrorHandler extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.message = message;
    Error.captureStackTrace(this, this.constructor);
  }
  json() {
    return {
      error: {
        code: this.code,
        message: this.message,
      },
    };
  }
}
module.exports = { ErrorHandler };
