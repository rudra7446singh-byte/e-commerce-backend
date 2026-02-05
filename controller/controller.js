import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import User from '../models/userModel.js'
let tempUserStorage = {};

function generateJwt(_id) {
  return jwt.sign({ _id: _id }, process.env.JWT_TOKEN, {});
}

// async function testAggregation() {
//   let pipeline = [
//     {$skip: 2},
//     {$limit: 2}
//   ]
//   console.log(JSON.stringify(pipeline), "-------");
  
//   const aggergate = await User.aggregate(pipeline);

//   console.log(aggergate);
// }

// testAggregation();


// ****** register **********

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, mobile, age, password } = req.body;

    if (!firstName || !lastName || !email || !mobile || !age || !password) {
      return res.status(400).json({
        success: false,
        message: "All filed are required",
      });
    }

    const otp = 1234;

    tempUserStorage[email] = {
      firstName,
      lastName,
      email,
      mobile,
      age,
      password,
      role,
      otp,
    };

    return res.json({
      success: true,
      message: "Otp sent",
      otp: otp,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ******** verifyOtp **********

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email/otp required",
      });
    }

    const tempUser = tempUserStorage[email];

    if (!tempUser) {
      return res.json({
        success: false,
        message: "no register user found",
      });
    }

    if (tempUser.otp != otp) {
      return res.json({
        success: false,
        message: "invalid otp",
      });
    } else {
      const user = await User.create({
        firstName: tempUser.firstName,
        lastName: tempUser.lastName,
        email: tempUser.email,
        mobile: tempUser.mobile,
        age: tempUser.age,
        password: tempUser.password,
        role: tempUser.role || "user",
        isVerified: true,
      });

      delete tempUserStorage[email];

      return res.status(200).json({
        success: true,
        message: "User register successfully",
        data: user,
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// *********** login **************

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email & password required",
    });
  }

  const loginUser = await User.findOne({ email });
  if (!loginUser) {
    return res.status(400).json({
      success: false,
      message: "User not found",
    });
  }

  const isMatched = await bcrypt.compare(password, loginUser.password);

  if (!isMatched) {
    return res.status(400).json({
      success: false,
      message: "Incorrect password",
    });
  }

  const token = generateJwt(loginUser._id);

  res.set("Authorization", `Bearer ${token}`);

  return res.status(200).json({
    success: true,
    message: "User logged in successfully",
    token: token,
  });
};



export const profile = async (req, res) => {
  try {
    const user = await User.findById(req._id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

