import { configureStore } from "@reduxjs/toolkit";
import userReduce from "../redux/userSlice";

export const store = configureStore({
  reducer: {
    user: userReduce,
  },
});
