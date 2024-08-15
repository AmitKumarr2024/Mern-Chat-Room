import { useEffect } from "react";
import { io } from "socket.io-client";
import { useDispatch } from "react-redux";
import { setOnlineUser, setSocketConnection } from "../redux/userSlice";

const useSocket = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const socketConnection = io(import.meta.env.VITE_REACT_APP_BACKEND_URL, {
      transports: ['websocket','polling'], // Force WebSocket transport
      auth: { token: localStorage.getItem("token") },
      reconnectionAttempts: 10,  // Try to reconnect up to 10 times
      reconnectionDelay: 5000,   // Wait 5 seconds between reconnection attempts
    });

    socketConnection.on("connect", () => {
      console.log("WebSocket connected successfully");
    });

    socketConnection.on("disconnect", (reason) => {
      if (reason === "io server disconnect") {
        console.log("Server disconnected. Attempting reconnection...");
        socketConnection.connect();
      } else {
        console.error("WebSocket disconnected due to:", reason);
      }
    });

    socketConnection.on("connect_error", (error) => {
      console.error("Connection error occurred:", error.message);
    });

    socketConnection.on("onlineUser", (data) => {
      console.log("Online users:", data);
      dispatch(setOnlineUser(data));
    });

    dispatch(setSocketConnection(socketConnection));

    return () => {
      if (socketConnection.connected) {
        socketConnection.disconnect();
      }
    };
  }, [dispatch]);
};

export default useSocket;
