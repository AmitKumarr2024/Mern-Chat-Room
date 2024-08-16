import jwt from 'jsonwebtoken';
import UserModel from '../context/Users/User_model.js';

const getUserDetailsFromToken = async (token) => {
  try {
    if (!token) {
      return {
        message: 'Session out',
        logout: true,
      };
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Fetch user details from the database
    const user = await UserModel.findById(decoded.id).select('-password');

    if (!user) {
      // User not found, implies session is invalid
      return {
        message: 'User not found',
        logout: true,
      };
    }

    // Return user details if everything is fine
    return {user};
  } catch (error) {
  
      console.error('Error in getUserDetailsFromToken:', error);
      return {
        message: 'An error occurred',
        logout: true,
      };
    
  }
};

export default getUserDetailsFromToken;
