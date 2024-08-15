import { createSlice } from "@reduxjs/toolkit";

// Initial state definition
const initialState = {
  _id: "",
  email: "",
  name: "",
  phone: "",
  profile_pic: "",
  token: "",
  onlineUser: [],
  socketConnection: null, // Non-serializable data
};

// Create a slice of the state
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Sets user details
    setUser: (state, action) => {
      const { _id, email, name, phone, profile_pic } = action.payload;
      state._id = _id;
      state.email = email;
      state.name = name;
      state.phone = phone;
      state.profile_pic = profile_pic;
    },
    // Sets the authentication token
    setToken: (state, action) => {
      state.token = action.payload;
    },
    // Logs out the user and resets state
    logout: (state) => {
      return {
        ...initialState, // Reset to initial state
        socketConnection: null, // Ensure socketConnection is reset
      };
    },
    // Updates the list of online users
    setOnlineUser: (state, action) => {
      state.onlineUser = action.payload;
    },
    // Sets the socket connection
    setSocketConnection: (state, action) => {
      state.socketConnection = action.payload;
    },
  },
});

// Export the action creators
export const { setUser, setToken, logout, setOnlineUser, setSocketConnection } = userSlice.actions;

// Export the reducer
export default userSlice.reducer;
