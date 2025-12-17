// const User = require("../models/userModel");
// const jwt = require("jsonwebtoken");

import jwt from 'jsonwebtoken'
import User from '../models/userModel.js'


export const checkAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    
    if (!authHeader) {
      return res.status(401).json({
        status: false,
        message: "Authorization token missing",
      });
    }

    const token = authHeader.split(" ")[1];
    const verified = jwt.verify(token, process.env.JWT_TOKEN);

    req.user = {_id: verified._id};
    next();
  } catch (error) {
    return res.status(401).json({
      status: false,
      message: "Invalid or expired token",
    });
  }
};
