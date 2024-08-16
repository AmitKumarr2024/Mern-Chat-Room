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
import { createSocketConnection } from "../helper/createSocketConnection ";
import axios from "axios";

function Home(props) {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(UserApi.userDetails.url, {
        withCredentials: true, // Send cookies with request
      });

      if (response.data) {
        dispatch(setUser(response.data.data));

        if (response.data.data.logout) {
          dispatch(logout());
          navigate("/login");
        }

        console.log("Current user details:", response.data);
      } else {
        console.error("Unexpected response structure:", response.data);
      }
    } catch (error) {
      console.error("Home:", error);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []); // Run only once on mount
    useEffect(() => {
    // WebSocket connection
    const socket = new WebSocket('wss://chat-me-apps-backend.onrender.com/socket.io/?EIO=4&transport=websocket');

    socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    socket.onmessage = (event) => {
      console.log('Message from server:', event.data);
      // Handle incoming messages here
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    // Cleanup on component unmount
    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []);

  useEffect(() => {
    // Create the socket connection
    const socketConnection = io(import.meta.env.VITE_REACT_APP_BACKEND_URL, {
      transports: ["websocket"], // Correctly specified as an array
      auth: {
        token: localStorage.getItem("token"),
      },
      reconnectionAttempts: 5, // Optional: Retry connection if failed
      transports: ["websocket"],
    });

    socketConnection.on("connect_error", (err) => {
      // the reason of the error, for example "xhr poll error"
      console.log(err.message);
    
      // some additional description, for example the status code of the initial HTTP response
      console.log(err.description);
    
      // some additional context, for example the XMLHttpRequest object
      console.log(err.context);
    });
    // Listen for 'onlineUser' event and dispatch action
    socketConnection.on("onlineUser", (data) => {
      console.log("Online users:", data);
      dispatch(setOnlineUser(data));
    });

    // Dispatch the socket connection to Redux or any global state management
    dispatch(setSocketConnection(socketConnection));

    // Cleanup the connection when component unmounts
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
