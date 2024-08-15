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

    console.log("decoded",decoded);
    

    if (!decoded || !decoded.id) {
      // Handle the case where the token is invalid or doesn't contain the required fields
      return {
        message: 'Invalid token',
        logout: true,
      };
    }

    // Fetch user details from the database
    const user = await UserModel.findById(decoded.id).select('-password');

    if (!user) {
      // Handle case where user is not found
      return {
        message: 'User not found',
        logout: true,
      };
    }

    return user;

  } catch (error) {
    console.error('Error with JWT token:', error);

    // Handle token verification errors (e.g., expired token)
    return {
      message: 'session out',
      logout: true,
    };
  }
};

export default userDetailsJsonWebToken;
