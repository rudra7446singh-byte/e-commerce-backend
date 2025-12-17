// const { errorHandle } = require("../utils/errorHandling");
import errorHandle from "../utils/errorHandling.js";

const errorMiddleware = (err, req, res, next) => {
  if (err instanceof errorHandle) {
    return res.status(err.statusCode || 404).json({
      success: err.success,
      message: err.message,
      errors: err.errors,
      stack: err.stack, // remove in production
    });
  }

  // Fallback error (unexpected errors)
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message,
  });
};

export default errorMiddleware;
