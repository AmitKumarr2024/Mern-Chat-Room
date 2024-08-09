import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Register from "../Pages/Register_page";
import CheckingPage from "../Pages/Checking_page";
import Home from "../Pages/Home_page";
import MessageSection from "../Components/Message-Section";
import AuthLayout from "../Layout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "register",
        element:<AuthLayout><Register /></AuthLayout>
        
      },
      {
        path: "checking",
        element:<AuthLayout><CheckingPage /></AuthLayout>
    
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
