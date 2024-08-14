import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Register from "../Pages/Register_page";
import Home from "../Pages/Home_page";
import MessageSection from "../Components/Message-Section";
import AuthLayout from "../Layout";
import Login_page from "../Pages/Login_page";
import ForgetPassword_page from "../Pages/ForgetPassword_page";

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
        element: <Home />,
        children: [
          {
            path: ":userId",
            element: <MessageSection />,
          },
        ],
      },
    ],
  },
]);

export default router;
