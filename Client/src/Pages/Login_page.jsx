import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { IoCloseOutline } from "react-icons/io5";
import uploadFile from "../helper/uploadCloudinary";
import axios from "axios";
import UserApi from "../common/user_url";
import loginpic from "../Assets/logins.jpg";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Avater from "../Components/Avater";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { setToken, setUser } from "../redux/userSlice";

function Login_page(props) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onSubmit = async (data) => {
    try {
      console.log("Form submission data:", data); // Log form data

      const response = await axios.post(UserApi.userLogin.url, data, {
        headers: {
          "Content-Type": "application/json", // Ensure the server knows to expect JSON
        },
        withCredentials: true, // Optional, if your server requires credentials
      });

      console.log("API response:", response.data); // Log API response

      if (response.data.success) {
        console.log("Login successful, token received:", response.data.data);
        
        dispatch(setToken(response.data.data));
        localStorage.setItem('token', response.data.data);
        toast.success(response.data.message);
        console.log("User details:", response.data.data);
        navigate("/");
      }
    } catch (error) {
      console.error(
        "Error submitting form:",
        error.response?.data || error.message
      );
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const email = watch("email");
  const password = watch("password");

  console.log("Email input value:", email); // Log email value
  console.log("Password input value:", password); // Log password value

  return (
    <div className="mt-4">
      <div className=" h-full  min-w-[70vw] max-w-xl flex flex-col justify-between gap-1 overflow-hidden p-4 mx-auto">
        <h1 className="text-2xl flex flex-col uppercase font-bold text-center mb-1">
          Login page
        </h1>

        <div className="min-h-[35vh] h-full min-w-[300px] flex-col md:flex-row  flex justify-center items-center gap-6 px-16">
          <section className="w-full h-full ">
            <img
              src={loginpic}
              className="w-full object-scale-down rounded-md mix-blend-multiply animate-pulse  transition-shadow"
              alt="Register image"
            />
          </section>
          <section className="w-full h-full p-6 rounded-xl shadow-xl bg-zinc-300">
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Email */}
              <div className="flex flex-col gap-1 ">
                <label htmlFor="email">Email</label>
                <input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/,
                      message: "Email is not valid",
                    },
                  })}
                  placeholder="Email"
                  id="email"
                  className="bg-slate-100 px-2 py-1 focus:outline-pink-600 border border-gray-300 rounded-md"
                />
                <p
                  className={`text-end font-bold text-xs mt-1 h-1 ${
                    errors.email
                      ? "text-red-500"
                      : /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/.test(email)
                      ? "text-green-500"
                      : "text-transparent"
                  }`}
                >
                  {errors.email
                    ? errors.email.message
                    : /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/.test(email)
                    ? "Valid Email"
                    : ""}
                </p>
              </div>

              {/* Password */}
              <div className="flex flex-col mb-4">
                <label htmlFor="password" className="font-semibold text-sm">
                  Password
                </label>
                <div className="w-full relative bg-slate-100 rounded-md flex items-center">
                  <input
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 10,
                        message: "Password must be at least 10 characters",
                      },
                    })}
                    placeholder="Password"
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className={`w-full bg-slate-100 px-2 pr-9 py-2 border border-gray-300 rounded-md focus:outline-pink-600 ${
                      errors.password ? "border-red-500" : ""
                    }`}
                  />
                  <div
                    className="absolute right-2 cursor-pointer text-xl"
                    onClick={() => setShowPassword((change) => !change)}
                  >
                    <span>{showPassword ? <FaEye /> : <FaEyeSlash />}</span>
                  </div>
                </div>
                <p
                  className={`text-end font-semibold text-xs mt-1 h-2 ${
                    errors.password
                      ? "text-red-500"
                      : watch("password") && watch("password").length >= 10
                      ? "text-green-500"
                      : "text-transparent"
                  }`}
                >
                  {errors.password
                    ? errors.password.message
                    : watch("password") && watch("password").length >= 10
                    ? "Password is strong"
                    : ""}
                </p>
              </div>
              <Link
                to={"/forget-password"}
                className="text-indigo-500 block text-end"
              >
                Forget Password?
              </Link>

              <button
                className="px-3 py-1 rounded-md text-white font-semibold uppercase w-full mt-3 border-2 bg-red-600 hover:bg-red-700 transition duration-300"
                type="submit"
              >
                Login
              </button>
            </form>
          </section>
        </div>

        <p className="text-center my-2 text-xl font-semibold">
          You have a account ?{" "}
          <Link to={"/register"} className="font-bold text-blue-500">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login_page;
