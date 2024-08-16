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

function Home(props) {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();


  const fetchUserDetails = async () => {
    try {
      const response = await fetch(UserApi.userDetails.url, {
        withCredentials: true, // Ensure this is correctly spelled and used
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

    } catch (error) {
      console.errror("Error fetching user details:", error);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []); // Run only once on mount

  useEffect(() => {
    // Create the socket connection
    const socketConnection = createSocketConnection();

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
