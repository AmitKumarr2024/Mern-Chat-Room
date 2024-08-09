import { token } from "morgan";
import UserModel from "./User_model.js";
import bcryptjs from "bcrypt";
import jsonWebToken from "jsonwebtoken";
import userDetailsJsonWebToken from "../../middleware/userDetailsJsonWebToken.js";

export const userRegister = async (req, res) => {
  try {
    const { name, email, password, phone, profile_pic } = req.body;
console.log('password',password);
console.log('name',name);
console.log('email',email);

    if (!password) {
      return res.status(400).json({
        message: "Password is required",
        error: true,
      });
    }

    const userExist = await UserModel.findOne({ email });
    if (userExist) {
      return res.status(400).json({
        message: "User already exists",
        success: false,
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(password, salt);

    const payload = {
      name,
      email,
      phone,
      profile_pic,
      password: hashPassword,
    };

    const user = new UserModel(payload);
    const UserSave = await user.save();

    return res.status(201).json({
      message: "User Created Successfully",
      data: UserSave,
      success: true,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "Something went wrong",
      data: error.message,
      error: true,
    });
  }
};


export const userLogin = async (req, res) => {
  try {
    const { password, email } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and Password are required",
        error: true,
      });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "This Email is not available",
        error: true,
      });
    }

    const isPasswordCorrect = await bcryptjs.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Password does not match, please check your password",
        error: true,
      });
    }

    const tokenData = {
      id: user._id,
      email: user.email,
    };

    const token = jsonWebToken.sign(tokenData, process.env.JWT_SECRET_KEY);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "strict", // Add sameSite attribute for better security
    };

    res.cookie("token", token, cookieOptions).status(200).json({
      message: "Login Successful",
      data: token,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      data: error.message,
      error: true,
    });
  }
};

export const userDetails = async (req, res) => {
  try {
    const token = req.cookies.token;

    const userDetails = await userDetailsJsonWebToken(token);

    return res.status(200).json({
      message: "Request completed successfully",
      data: userDetails,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      data: error.message,
      error: true,
    });
  }
};

export const logout = async (req, res) => {
  try {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "strict", // Add sameSite attribute for better security
    };

    return res.cookie("token", "", cookieOptions).status(200).json({
      message: "Logout request successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      data: error.message,
      error: true,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const token = req.cookies.token || "";

    if (!token) {
      return res.status(401).json({
        message: "Authentication token is required",
        error: true,
      });
    }

    const { name, profile_pic,phone, email } = req.body;

    const user = await userDetailsJsonWebToken(token);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        error: true,
      });
    }

    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: user._id },
      {
        name,
        profile_pic,
        email,
        phone
      },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: "User update failed",
        error: true,
      });
    }

    res.status(200).json({
      message: "User Details updated Successfully",
      data: updatedUser,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      data: error.message,
      error: true,
    });
  }
};
