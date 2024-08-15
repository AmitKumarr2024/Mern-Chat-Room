// userSlice.js
import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    _id: '',
    email: '',
    name: '',
    phone: '',
    profile_pic: '',
    onlineUser: [],
    socketConnection: null,
    token: '',
  },
  reducers: {
    setUser(state, action) {
      return { ...state, ...action.payload };
    },
    logout(state) {
      return {
        _id: '',
        email: '',
        name: '',
        phone: '',
        profile_pic: '',
        onlineUser: [],
        socketConnection: null,
        token: '',
      };
    },
    setOnlineUser(state, action) {
      state.onlineUser = action.payload;
    },
    setSocketConnection(state, action) {
      state.socketConnection = action.payload;
    },
  },
});

export const { setUser, logout, setOnlineUser, setSocketConnection } = userSlice.actions;
export default userSlice.reducer;
