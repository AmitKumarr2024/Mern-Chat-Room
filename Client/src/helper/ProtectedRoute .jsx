import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  // Check if token is present in localStorage
  const token = localStorage.getItem("token");

  console.log("token is available",token);
  
  
  // If the token is missing, navigate to the login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If token exists, render the protected route's children
  return children;
};

export default ProtectedRoute;

