import jwt from 'jsonwebtoken';
import UserModel from '../context/Users/User_model.js';

const getUserDetailsFromToken = async (token) => {
  try {
    if (!token) {
      return {
        message: 'session out',
        logout: true,
      };
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    // Fetch user details from the database
    const user = await UserModel.findById(decoded.id).select('-password');
    
    if (!user) {
      // User not found, could imply session is invalid
      return {
        message: 'User not found',
        logout: true,
      };
    }

    // Return user details if everything is fine
    return {
      user,
      message: 'User details retrieved successfully',
      logout: false,
    };
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      // Invalid token
      return {
        message: 'Invalid token',
        logout: true,
      };
    } else if (error.name === 'TokenExpiredError') {
      // Token has expired
      return {
        message: 'Token expired',
        logout: true,
      };
    } else {
      // General error
      console.error('Error in getUserDetailsFromToken:', error);
      return {
        message: 'An error occurred',
        logout: true,
      };
    }
  }
  
};

export default getUserDetailsFromToken;
