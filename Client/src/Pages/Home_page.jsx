import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import UserApi from "../common/user_url";
import { useDispatch, useSelector } from "react-redux";
import { setUser, logout, setOnlineUser, setSocketConnection } from "../redux/userSlice";
import Section from "../Components/Section";
import Logo from "../Assets/chatmeapp2.jpg";
import io from "socket.io-client";

function Home(props) {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const location = useLocation();

  console.log("redux user", user);

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem("token"); // Get token from localStorage
      console.log("Token from localStorage:", token);

      if (!token) {
        console.log("No token found");
        return;
      }

      const response = await fetch(UserApi.userDetails.url, {
        method: "GET",
        credentials: "include", // If session is cookie-based
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Send token in Authorization header
        },
      });

      if (!response.success) {
        console.log("API response status:", response.status);
        console.log("API response status text:", response.statusText);
      }

      const data = await response.json();
      console.log("Fetched user data:", data.data);

      // Set user details in Redux
      dispatch(setUser(data.data));

      // Handle logout if session expired
      if (data.data?.logout) {
        console.log("Session expired. Logging out.");
        dispatch(logout());
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
    });

    console.log("Socket connection established:", socketConnection);

    socketConnection.on("connect", () => {
      console.log("Socket connected:", socketConnection.id);
    });

    socketConnection.on("onlineUser", (data) => {
      console.log("Online users received:", data);
      dispatch(setOnlineUser(data));
    });

    socketConnection.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    dispatch(setSocketConnection(socketConnection));

    return () => {
      socketConnection.disconnect();
      console.log("Socket connection closed");
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
          <img
            src={Logo}
            width={150}
            className="rounded-3xl"
            alt="App Logo"
          />
        </div>
        <p className="text-lg mt-2 text-center text-slate-500 font-semibold capitalize">
          Explore User to Send Messages.
        </p>
      </div>
    </div>
  );
}

export default Home;
