import jwt from 'jsonwebtoken';
import UserModel from '../context/Users/User_model.js';

const userDetailsJsonWebToken = async (token) => {
  try {
    if (!token) {
      return {
        message: 'session out',
        logout: true,
      };
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    console.log("Decoded token:", decoded);

    // Check if the token is expired
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    if (decoded.exp < currentTime) {
      return {
        message: 'session out',
        logout: true,
      };
    }

    // Fetch user details from the database
    const user = await UserModel.findById(decoded.id).select('-password');

    console.log("Fetched user:", user);

    if (!user) {
      // Handle case where user is not found
      return {
        message: 'User not found',
        logout: true,
      };
    }

    // Return the user details
    return {
      message: 'Request completed successfully',
      data: user,
      success: true,
    };

  } catch (error) {
    console.error('Error with JWT token:', error);

    // Handle token verification errors (e.g., invalid token)
    return {
      message: 'session out',
      logout: true,
    };
  }
};

export default userDetailsJsonWebToken;
