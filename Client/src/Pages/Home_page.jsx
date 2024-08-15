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

function Home() {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUserDetails = async () => {
    try {
      const response = await fetch(UserApi.userDetails.url, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      dispatch(setUser(data.data));

      if (data.data.logout) {
        dispatch(logout());
        navigate("/login");
      }
    } catch (error) {
      console.error("User details error:", error);
      // Optionally show a user-friendly message here
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [dispatch, navigate]);

  useEffect(() => {
    const socketConnection = io(import.meta.env.VITE_REACT_APP_BACKEND_URL, {
      auth: {
        token: localStorage.getItem("token"),
      },
    });

    socketConnection.on("onlineUser", (data) => {
      dispatch(setOnlineUser(data));
    });
    dispatch(setSocketConnection(socketConnection));

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
