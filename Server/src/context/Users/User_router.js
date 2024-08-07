import express from "express";
import {
  logout,
  updateUser,
  userDetails,
  userLogin,
  userRegister,
} from "./User_controller.js";

const route = new express.Router();

route.post("/create", userRegister);
route.get("/login", userLogin);
route.get("/user-details", userDetails);
route.post("/logout", logout);
route.post("/user-update", updateUser);

export default route;
