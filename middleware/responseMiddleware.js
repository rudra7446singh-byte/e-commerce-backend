const  { resHandle }  = require("../utils/resHandle");

const responseMiddleware = (req, res, next) => {
  res.success = (statusCode, data = null, message = "Success") => {
    const response = new resHandle(statusCode || 200, data, message);
    return res.status(statusCode).json(response);
  };

  next();
};

module.exports = { responseMiddleware };
