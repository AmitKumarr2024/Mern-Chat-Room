import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Register from "../Pages/Register_page";
import Home from "../Pages/Home_page";
import MessageSection from "../Components/Message-Section";
import AuthLayout from "../Layout";
import Login_page from "../Pages/Login_page";
import ForgetPassword_page from "../Pages/ForgetPassword_page";
// import ProtectedRoute from '../helper/ProtectedRoute ' // Import the protected route component

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "register",
        element: (
          <AuthLayout>
            <Register />
          </AuthLayout>
        ),
      },
      {
        path: "login",
        element: (
          <AuthLayout>
            <Login_page />
          </AuthLayout>
        ),
      },
      {
        path: "forget-password",
        element: (
          <AuthLayout>
            <ForgetPassword_page />
          </AuthLayout>
        ),
      },
      {
        path: "",
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ), // Protect the home route
        children: [
          {
            path: ":userId",
            element: (
              <ProtectedRoute>
                <MessageSection />
              </ProtectedRoute>
            ), // Protect the message section route
          },
        ],
      },
    ],
  },
]);

export default router;
