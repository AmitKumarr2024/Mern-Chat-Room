// src/hooks/useSocket.js
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import io from 'socket.io-client';
import { setOnlineUser, setSocketConnection } from '../redux/userSlice';

const useSocket = (token) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!token) return;

    console.log("Initializing socket connection...");

    // Initialize socket connection
    const socketConnection = io(import.meta.env.VITE_REACT_APP_BACKEND_URL, {
      auth: { token },
    });

    // Handle successful connection
    socketConnection.on("connect", () => {
      console.log("Socket connected:", socketConnection.id);
    });

    // Handle online user updates
    socketConnection.on("onlineUser", (data) => {
      console.log("Received online users data:", data);
      dispatch(setOnlineUser(data));
    });

    // Handle errors
    socketConnection.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    // Handle disconnection
    socketConnection.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    // Dispatch the socket connection to the Redux store
    dispatch(setSocketConnection(socketConnection));

    // Cleanup function to disconnect the socket when the component unmounts
    return () => {
      console.log("Disconnecting socket...");
      socketConnection.disconnect();
      dispatch(setSocketConnection(null)); // Clear socket connection in the store
    };
  }, [token, dispatch]);

  // Optionally return socketConnection if you need to use it in the component
  return null;
};

export default useSocket;
