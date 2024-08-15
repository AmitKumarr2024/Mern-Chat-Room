import { token } from "morgan";
import UserModel from "./User_model.js";
import bcryptjs from "bcrypt";
import jwt from "jsonwebtoken";
import userDetailsjwt from "../../middleware/userDetailsjwt.js";

export const userRegister = async (req, res) => {
  try {
    const { name, email, password, phone, profile_pic } = req.body;
   

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

    // Check if user is already logged in
    const tokenFromCookie = req.cookies.token;
    if (tokenFromCookie) {
      try {
        const decodedToken = await jwt.verify(tokenFromCookie, process.env.jwt_SECRET_KEY);

        // Check if the decoded token's ID matches the user ID
        if (decodedToken.id === user._id.toString()) {
          return res
            .status(400)
            .json({ message: "You are already logged in", error: true });
        }
      } catch (err) {
        // If the token is invalid or expired, log the error but don't return it
        console.error("Token verification error:", err.message);
      }
    }

    const tokenData = {
      id: user._id,
      email: user.email,
    };

    const token = jwt.sign(tokenData, process.env.jwt_SECRET_KEY, { expiresIn: '1h' }); // Adjust expiration as needed

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // Adjust for development and production
      path: "/", // Ensure cookie path is set correctly
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

    const userDetails = await userDetailsjwt(token);

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

    console.log("Received token:", token); // Log token for debugging

    const { name, profile_pic, phone, email } = req.body;
    console.log("Received data:", { name, profile_pic, phone, email }); // Log received data

    const user = await userDetailsjwt(token);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        error: true,
      });
    }

    console.log("User from token:", user); // Log user details from token

    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: user._id },
      {
        name,
        profile_pic,
        email,
        phone,
      },
      { new: true } // Return the updated document
    );

    console.log("Updated user:", updatedUser); // Log updated user

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
    console.error("Error in updateUser:", error); // Log the error for debugging
    res.status(500).json({
      message: "Something went wrong",
      data: error.message,
      error: true,
    });
  }
};
export const searchUser = async (req, res) => {
  try {
    const { search } = req.body;

    // Create a regex pattern for name and email search
    const query = new RegExp(search, "i");

    // Initialize the conditions array with name and email search conditions
    const conditions = [{ name: query }, { email: query }];

    // Add phone search condition, assuming phone numbers are stored as strings
    if (!isNaN(search)) {
      // If the search term is numeric or close to numeric
      conditions.push({ phone: search }); // Treating phone as a string match
    }

    // Perform the search using the conditions array
    const users = await UserModel.find({
      $or: conditions,
    }).select("-password");

    res.status(200).json({
      message: "All Users are Here",
      data: users,
      success: true,
    });
  } catch (error) {
    console.error("Error in searchUser:", error); // Log the error for debugging
    res.status(500).json({
      message: "Something went wrong",
      data: error.message,
      error: true,
    });
  }
};
