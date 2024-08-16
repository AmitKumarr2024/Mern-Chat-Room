import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import UserApi from "../common/user_url";
import { useDispatch, useSelector } from "react-redux";
import {
  setUser,
  logout,
  setOnlineUser,
  setSocketConnection,
} from "../redux/userSlice";
import Section from "../Components/Section";
import Logo from "../Assets/chatmeapp2.jpg";
import io from "socket.io-client";

function Home(props) {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  console.log("redux user", user);

  const fetchUserDetails = async () => {
    try {
      const response = await fetch(UserApi.userDetails.url, {
        credentials: "include", // Ensure this is correctly spelled and used
      });

      // Check if response is ok
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Parse response data
      const data = await response.json();

      // Set user details in Redux
      dispatch(setUser(data.data));

      // Handle logout if session expired
      if (data.data.logout) {
        dispatch(logout());
        navigate("/login");
      }

      console.log("User details response:", data);
    } catch (error) {
      console.log("Error fetching user details:", error);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []); // Run only once on mount

  useEffect(() => {
    const socketConnection = io(import.meta.env.VITE_REACT_APP_BACKEND_URL, {
      auth: {
        token: localStorage.getItem("token"),
      },
      transports: ["websocket"],
      pingInterval: 1000 * 60 * 5,
      pingTimeout: 60000,
    });

    
    socketConnection.on("connect_error", (err) => {
      // the reason of the error, for example "xhr poll error"
      console.log(err.message);
      
      // some additional description, for example the status code of the initial HTTP response
      console.log(err.description);
      
      // some additional context, for example the XMLHttpRequest object
      console.log(err.context);
    });

    socketConnection.on("onlineUser", (data) => {
      console.log("Online users:", data);
      dispatch(setOnlineUser(data));
    });

    dispatch(setSocketConnection(socketConnection));

    return () => {
      socketConnection.disconnect();
    };
  }, []);

  const basePath = location.pathname === "/";

  return (
    <div className="grid lg:grid-cols-[300px,1fr] h-screen max-h-screen">
      {/* Sidebar section */}
      <section className={`bg-white ${!basePath && "hidden"} lg:block`}>
        <Section />
      </section>

      {/* Main content section */}
      <section className={`${basePath ? "hidden" : "block"}`}>
        <Outlet />
      </section>

      {/* App image and message */}
      <div
        className={`hidden justify-center items-center flex-col gap-2 ${
          !basePath ? "hidden" : "lg:flex"
        }`}
      >
        <div>
          <img src={Logo} width={150} className="rounded-3xl" alt="App Logo" />
        </div>
        <p className="text-lg mt-2 text-center text-slate-500 font-semibold capitalize">
          Explore User to Send Messages.
        </p>
      </div>
    </div>
  );
}

export default Home;
