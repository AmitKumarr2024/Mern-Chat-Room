import { useEffect, useState } from 'react';
import io from 'socket.io-client'; // Adjust import based on your setup

const useSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(); // Initialize socket connection
    setSocket(newSocket);

    return () => {
      newSocket.disconnect(); // Clean up on unmount
    };
  }, []);

  return socket;
};

export default useSocket;
