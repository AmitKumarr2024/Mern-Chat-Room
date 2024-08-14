import express from "express";
import {
  logout,
  searchUser,
  updateUser,
  userDetails,
  userLogin,
  userRegister,
} from "./User_controller.js";

const route = new express.Router();

route.post("/create", userRegister);
route.post("/login", userLogin);
route.get("/user-details", userDetails);
route.post("/logout", logout);
route.post("/user-update", updateUser);
route.post("/search-user", searchUser);

export default route;
