import React from "react";
import { Navigate } from "react-router-dom";
import { decode as jwt_decode } from "jwt-decode"; // Correct import for named export

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  const isTokenValid = () => {
    if (!token) return false;

    try {
      const decodedToken = jwt_decode(token);
      const currentTime = Date.now() / 1000; // Current time in seconds
      return decodedToken.exp > currentTime; // Check if token is still valid
    } catch (error) {
      console.error("Invalid token:", error);
      return false;
    }
  };

  if (!isTokenValid()) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
