import { Navigate } from "react-router-dom";
import jwtDecode from "jwt-decode";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  // If the token is missing, navigate to the login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    // Decode the token to check for expiry
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Convert to seconds

    // If the token is expired, navigate to the login page
    if (decodedToken.exp < currentTime) {
      return <Navigate to="/login" replace />;
    }

  } catch (error) {
    // If token is invalid, navigate to login
    console.error("Invalid token", error);
    return <Navigate to="/login" replace />;
  }

  // If token is valid and not expired, render the children
  return children;
};

export default ProtectedRoute;
