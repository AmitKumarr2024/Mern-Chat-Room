const useSocket = (token) => {
    const dispatch = useDispatch();
  
    useEffect(() => {
      if (!token) return;
  
      console.log("Initializing socket connection...");
  
      const socketConnection = io(import.meta.env.VITE_REACT_APP_BACKEND_URL, {
        auth: { token },
      });
  
      socketConnection.on("connect", () => {
        console.log("Socket connected:", socketConnection.id);
      });
  
      socketConnection.on("onlineUser", (data) => {
        console.log("Received online users data:", data);
        dispatch(setOnlineUser(data));
      });
  
      dispatch(setSocketConnection(socketConnection));
  
      return () => {
        console.log("Disconnecting socket...");
        socketConnection.disconnect();
      };
    }, [token, dispatch]);
  };
  