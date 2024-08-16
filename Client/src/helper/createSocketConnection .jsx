import { io } from "socket.io-client";

// Define the connection function
export const createSocketConnection = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.error("No token found, socket connection aborted.");
    return null; // Return early if no token exists
  }

  // Create the socket connection with backend URL from environment variables
  const socketConnection = io(import.meta.env.VITE_REACT_APP_BACKEND_URL, {
    path: "/socket.io",
    transport: ["websocket"],
    auth: {
      token: token,
    },
    transports: ["websocket", "polling"],
    pingInterval: 1000 * 60 * 10, // 10 minutes
    pingTimeout: 1000 * 60 * 5, // 5 minutes
    reconnectionAttempts: 5, // Limit reconnection attempts to 5
    reconnectionDelay: 2000, // Delay between reconnection attempts (2 seconds)
  });

  // Listen for connection errors and log them
  socketConnection.on("connect_error", (err) => {
    console.error("Connection error:", err.message);
    if (err.message === "invalid_token") {
      console.error("Invalid token, please re-authenticate.");
    }
    console.error("Description:", err.description);
    console.error("Context:", err.context);
  });

  // Listen for successful reconnection
  socketConnection.on("reconnect", (attemptNumber) => {
    console.log(`Reconnected successfully after ${attemptNumber} attempts`);
  });

  // Listen for reconnection attempts
  socketConnection.on("reconnect_attempt", (attemptNumber) => {
    console.log(`Attempting to reconnect: Attempt ${attemptNumber}`);
  });

  // Listen for failed reconnection
  socketConnection.on("reconnect_failed", () => {
    console.error("Reconnection failed after multiple attempts.");
  });

  // Handle disconnection
  socketConnection.on("disconnect", (reason) => {
    console.warn("Socket disconnected:", reason);
    if (reason === "io server disconnect") {
      // The disconnection was initiated by the server, you may want to reconnect manually here
      socketConnection.connect(); // Attempt to reconnect manually
    }
  });

  return socketConnection;
};
