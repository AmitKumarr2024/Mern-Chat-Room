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

  const fetchUserDetails = async () => {
    try {
      const response = await fetch(UserApi.userDetails.url, {
        credentials: "include", // Ensure this is correctly used for credentials
      });

      const data = await response.json(); // Extract JSON data

      dispatch(setUser(data.data));

      if (data.data.logout) {
        dispatch(logout());
        navigate("/login");
      }
      console.log("Current user details", data);
    } catch (error) {
      console.error("Home:", error);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []); // Run only once on mount

  useEffect(() => {
    // WebSocket connection setup
    const address = "wss://chat-me-apps-backend.onrender.com/socket.io/?EIO=4&transport=websocket&sid=LY0LxwUPmYxIUkFtAAAI";
    const webSocket = new WebSocket(address);

    webSocket.onopen = () => {
      console.log("WebSocket connection opened.");
    };

    webSocket.onmessage = (event) => {
      console.log("Message from WebSocket:", event.data);
      // Handle WebSocket messages if needed
    };

    webSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    // Socket.io connection setup
    const socketConnection = io(import.meta.env.VITE_REACT_APP_BACKEND_URL, {
      auth: {
        token: localStorage.getItem("token"),
      },
    });

    socketConnection.on("onlineUser", (data) => {
      console.log("Online users:", data);
      dispatch(setOnlineUser(data));
    });

    dispatch(setSocketConnection(socketConnection));

    // Cleanup connections on component unmount
    return () => {
      if (webSocket.readyState === WebSocket.OPEN) {
        webSocket.close();
        console.log("WebSocket connection closed.");
      }
      socketConnection.disconnect();
      console.log("Socket.io connection disconnected.");
    };
  }, [dispatch]);

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
