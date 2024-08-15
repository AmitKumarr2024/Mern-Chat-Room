import jwt from 'jsonwebtoken';
import UserModel from '../context/Users/User_model.js';

const getUserDetailsFromToken = async (token) => {
  if (!token) {
    return {
      message: 'session out',
      logout: true,
    };
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  const user = await UserModel.findById(decoded.id).select('-password');

  return user;
};

export default getUserDetailsFromToken;
