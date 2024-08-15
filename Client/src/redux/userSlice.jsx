import { createSlice } from "@reduxjs/toolkit";

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

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      // Destructure action.payload directly for clarity
      const { _id, email, name, phone, profile_pic } = action.payload;
      state._id = _id;
      state.email = email;
      state.name = name;
      state.phone = phone;
      state.profile_pic = profile_pic;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    logout: (state) => {
      state._id = "";
      state.email = "";
      state.name = "";
      state.phone = "";
      state.profile_pic = "";
      state.token = "";
      state.socketConnection = null; // Reset to null instead of an empty string
    },
    setOnlineUser: (state, action) => {
      state.onlineUser = action.payload;
    },
    setSocketConnection: (state, action) => {
      state.socketConnection = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setUser, setToken, logout, setOnlineUser, setSocketConnection } = userSlice.actions;

export default userSlice.reducer;
