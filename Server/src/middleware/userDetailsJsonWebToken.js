import jwt from "jsonwebtoken";
import UserModel from "../context/Users/User_model.js";

const userDetailsJsonWebToken = async (token) => {
  try {
    if (!token) {
      return {
        message: "session out",
        logout: true,
      };
    }
    const decode = await jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await UserModel.findById(decode.id).select('-password');
    return user;
  } catch (error) {
    console.log("Error with jwt token", error);
  }
};

export default userDetailsJsonWebToken;
