import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { IoCloseOutline } from "react-icons/io5";
import uploadFile from "../helper/uploadCloudinary";
import axios from "axios";
import UserApi from "../common/user_url";
import regpic from "../Assets/registerr.jpg";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";

function Register() {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      profile_pic: "",
    },
  });
  const [showPassword, setShowPassword] = useState(false);
  const [uploadPic, setUploadPic] = React.useState(null);
  const navigate = useNavigate();

  const handleUploadPic = async (e) => {
    const file = e.target.files[0];

    if (!file) return; // Check if file is selected

    try {
      // Assuming uploadFile returns an object with a URL and file information
      const uploadPhoto = await uploadFile(file);

      // Update uploadPic state with the file info
      setUploadPic({
        name: file.name, // Include file name
        url: uploadPhoto.url, // Include URL if needed
      });

      reset((prev) => ({
        ...prev,
        profile_pic: uploadPhoto.url,
      }));
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleClearPicInput = (e) => {
    e.preventDefault();
    setUploadPic(null);
  };

  const onSubmit = async (data) => {
    const formattedData = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      profile_pic: data.profile_pic,
    };

    try {
      const response = await axios.post(UserApi.createUser.url, formattedData, {
        withCredentials: true,
      });

      if (response.data.success) {
        toast.success(response.data.message);
        reset({
          name: "",
          email: "",
          phone: "",
          password: "",
          profile_pic: "",
        });
        navigate("/login");
      }
    } catch (error) {
      console.error(
        "Error submitting form:",
        error.response?.data || error.message,
        toast.error(error.response.data.message)
      );
    }
  };

  const name = watch("name");
  const email = watch("email");
  const phone = watch("phone");

  return (
    <div className="mt-2">
      <div className="h-[90vh] min-w-[70vw] max-w-md flex flex-col justify-between gap-4 overflow-hidden p-4 mx-auto">
        <h1 className="text-3xl flex flex-col uppercase  font-extrabold text-center mb-2">
          Welcome To Chat App
          <span className="text-xs">Registration page</span>
        </h1>

        <div className="min-h-[45vh] h-full min-w-[300px] flex-col md:flex-row flex justify-center items-center gap-6 px-10">
          <section className="w-full h-full flex justify-center items-center">
            <img
              src={regpic}
              className="w-full object-cover rounded-md mix-blend-multiply animate-pulse  transition-opacity"
              alt="Register image"
            />
          </section>
          <section className="w-full h-full p-4 rounded-xl shadow-xl bg-zinc-300">
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Name */}
              <div className="flex flex-col mb-1">
                <label htmlFor="name" className="font-semibold text-sm">
                  Name
                </label>
                <input
                  {...register("name", {
                    required: "Name is required",
                    minLength: {
                      value: 6,
                      message: "Name must be at least 6 characters",
                    },
                    maxLength: {
                      value: 20,
                      message: "Name must be no more than 20 characters",
                    },
                  })}
                  placeholder="Name"
                  id="name"
                  className="bg-slate-100 px-3 py-2 border border-gray-300 rounded-md focus:outline-pink-600"
                />
                <p
                  className={`text-end font-semibold  text-xs mt-1 h-1 ${
                    errors.name
                      ? "text-red-500"
                      : name?.length >= 6 && name.length <= 20
                      ? "text-green-500"
                      : "text-transparent"
                  }`}
                >
                  {errors.name
                    ? errors.name.message
                    : name?.length >= 6 && name.length <= 20
                    ? "Name looks good!"
                    : ""}
                </p>
              </div>

              {/* Email */}
              <div className="flex flex-col mb-2">
                <label htmlFor="email" className="font-semibold text-sm">
                  Email
                </label>
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
                  className="bg-slate-100 px-3 py-2 border border-gray-300 rounded-md focus:outline-pink-600"
                />
                <p
                  className={`text-end font-semibold  text-xs mt-1 h-1 ${
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

              {/* Phone */}
              <div className="flex flex-col mb-2">
                <label htmlFor="phone" className="font-semibold text-sm">
                  Phone
                </label>
                <input
                  {...register("phone", {
                    required: "Phone is required",
                    minLength: {
                      value: 10,
                      message: "Phone must be at least 10 characters",
                    },
                    maxLength: {
                      value: 15,
                      message: "Phone must be no more than 15 characters",
                    },
                    pattern: {
                      value: /^[0-9]+$/,
                      message: "Phone number must be numeric",
                    },
                  })}
                  placeholder="Phone"
                  id="phone"
                  type="tel"
                  className={`bg-slate-100 px-3 py-2 border border-gray-300 rounded-md focus:outline-pink-600 ${
                    phone && phone.length < 10
                      ? "border-red-500"
                      : "border-green-500"
                  }`}
                />
                <p
                  className={`text-end font-semibold text-xs mt-1 h-1 ${
                    phone && phone.length < 10
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  {phone && phone.length < 10
                    ? "Phone must be at least 10 characters"
                    : phone
                    ? "Phone number looks good!"
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
                    className={`w-full bg-slate-100 px-3 pr-9 py-2 border border-gray-300 rounded-md focus:outline-pink-600 ${
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

              {/* Profile Pic */}
              <div className="flex flex-col mb-2">
                <label htmlFor="profile_pic">
                  <div className="cursor-pointer h-16 bg-white flex justify-center items-center text-slate-500 border hover:border-pink-600 hover:border-2">
                    <p
                      className={`text-sm max-w-[300px] text-ellipsis line-clamp-1 font-semibold  ${
                        uploadPic?.name ? "text-blue-600" : ""
                      }`}
                    >
                      {uploadPic?.name
                        ? uploadPic?.name
                        : "Upload Your Profile Pic"}
                    </p>
                    {uploadPic?.name && (
                      <button
                        className="text-2xl ml-3 hover:text-red-600"
                        type="button"
                        onClick={handleClearPicInput}
                      >
                        <IoCloseOutline />
                      </button>
                    )}
                  </div>
                </label>
                <input
                  {...register("profile_pic")}
                  type="file"
                  id="profile_pic"
                  className="bg-slate-100 px-2 py-1 focus:outline-pink-600 hidden"
                  onChange={handleUploadPic}
                />
              </div>

              <button
                className="px-4 py-2 rounded-md text-white font-semibold uppercase w-full mt-1 border-2 bg-red-600 hover:bg-red-700 transition duration-300"
                type="submit"
              >
                Register
              </button>
            </form>
          </section>
        </div>

        <p className="text-center my-2 text-xl font-semibold">
          Already a user?{" "}
          <Link to={"/login"} className="font-bold text-blue-500">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
