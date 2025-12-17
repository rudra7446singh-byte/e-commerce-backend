import MESSAGES from "../messages/message.js";
import User from "../models/userModel.js";
import ROLE_STATUS from "../config/constant.js";

const roleValidation = async (req, res, next) => {
  try {
    const result = await User.findOne({ _id: req.user._id });

    if (!result) {
      return res.status(404).json({ message: "User not found" });
    }

    if (result.role === ROLE_STATUS.ROLE.ADMIN) {
      return next();
    }

    res.status(400).json({ message: MESSAGES.AUTH.UNAUTHORIZED });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export default roleValidation;
