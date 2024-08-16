import { io } from "socket.io-client";

// Define the connection function
export const createSocketConnection = () => {
  // Create the socket connection with backend URL from environment variables
  const socketConnection = io(import.meta.env.VITE_REACT_APP_BACKEND_URL, {
    auth: {
      token: localStorage.getItem("token"),
    },
    transports: ["websocket", "polling"],
    pingInterval: 1000 * 60 * 10, // 10 minutes
    pingTimeout: 1000 * 60 * 5,   // 5 minutes
  });

  // Listen for connection errors and log them
  socketConnection.on("connect_error", (err) => {
    console.error("Connection error:", err.message);
    console.error("Description:", err.description);
    console.error("Context:", err.context);
  });

  return socketConnection;
};
