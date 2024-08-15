import jwt from "jsonwebtoken";
import UserModel from "../context/Users/User_model.js";

const userDetailsJsonWebToken = async (token) => {
  try {
    if (!token) {
      return {
        message: "session out",
        logout: true, // Fixed typo here: changed "logotu" to "logout"
      };
    }

    // Verify the token
    const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    // Fetch user details
    const user = await UserModel.findById(decode.id).select('-password');

    // If user is not found
    if (!user) {
      return {
        message: "session out",
        logout: true,
      };
    }

    // Return user details if everything is okay
    return {
      message: "Request completed successfully",
      data: user,
      success: true,
    };

  } catch (error) {
    console.error("Error with JWT token", error);

    // Return error message for invalid token or other errors
    return {
      message: "session out",
      logout: true,
    };
  }
};

export default userDetailsJsonWebToken;
