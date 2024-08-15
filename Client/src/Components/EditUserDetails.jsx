import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import Avater from "./Avater";
import Divider from "./Divider.jsx";
import uploadFile from "../helper/uploadCloudinary.jsx";
import toast from "react-hot-toast";
import UserApi from "../common/user_url.jsx";
import axios from "axios";
import { setUser } from "../redux/userSlice.jsx";

function EditUserDetails({ onClose }) {
  const user = useSelector((state) => state?.user);
  const uploadPhotoRef = useRef();
  const dispatch = useDispatch();
  const [imageUrl, setImageUrl] = useState(user?.profile_pic || "");

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
      profile_pic: user?.profile_pic || "",
    },
  });

  useEffect(() => {
    // Update image URL state and reset form values
    setImageUrl(user?.profile_pic || "");
    reset({
      name: user?.name || "",
      phone: user?.phone || "",
      profile_pic: user?.profile_pic || "",
    });
  }, [user, reset]);

  const handleOptionUploadPic = () => {
    uploadPhotoRef.current.click();
  };

  const handleUploadPic = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const uploadPhoto = await uploadFile(file);
      setValue("profile_pic", uploadPhoto.url);
      setImageUrl(uploadPhoto.url);
    } catch (error) {
      toast.error("Error uploading file.");
    }
  };

  const onSubmit = async (data) => {
    const formattedData = {
      name: data.name,
      phone: data.phone,
      profile_pic: data.profile_pic,
    };

    try {
      const response = await axios.post(UserApi.userUpdate.url, formattedData, {
        withCredentials: true,
      });

      if (response?.data?.success) {
        toast.success(response.data.message);
        dispatch(setUser(response.data.data));
        onClose();
      } else {
        toast.error(response?.data?.message || "Something went wrong!");
      }
    } catch (error) {
      toast.error("Error occurred during submission.");
    }
  };

  const phone = watch("phone");

  return (
    <div className="fixed inset-0 bg-gray-700 bg-opacity-55 flex justify-center items-center z-50">
      <div className="bg-white p-6 m-1 rounded w-full max-w-lg flex flex-col gap-2 justify-center relative">
        <h2 className="font-semibold text-xl">Profile Details</h2>
        <p className="text-sm font-semibold capitalize">Edit User Details</p>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* name */}
          <div className="flex flex-row items-center gap-4 mb-1">
            <label htmlFor="name" className="font-medium text-">
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
              className={`text-end font-semibold text-xs mt-1 h-1 ${
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

          {/* photo */}
          <div className="flex items-center gap-4 my-4">
            <div>Photo:</div>
            <div className="my-1 flex flex-row justify-around gap-4 items-center">
              <Avater
                width={55}
                height={55}
                imageUrl={imageUrl} // Use state for image URL
                name={user?.name}
              />
              <label htmlFor="profile_pic">
                <button className="font-bold border p-2 rounded border-black" type="button" onClick={handleOptionUploadPic}>
                  Change Photo
                </button>
                <input
                  type="file"
                  id="profile_pic"
                  className="hidden"
                  onChange={handleUploadPic}
                  ref={uploadPhotoRef}
                />
              </label>
            </div>
          </div>

          {/* phone */}
          <div className="flex flex-row gap-4 items-center my-2">
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
                phone && phone.length < 10 ? "text-red-500" : "text-green-500"
              }`}
            >
              {phone && phone.length < 10
                ? "Phone must be at least 10 characters"
                : phone
                ? "Phone number looks good!"
                : ""}
            </p>
          </div>

          <Divider />
          <div className="flex justify-end gap-3 items-center mt-3">
            <button
              type="submit"
              className="border-2 border-red-700 py-1 px-3 rounded hover:bg-red-700 hover:text-white"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onClose}
              className="border-2 border-red-700 py-1 px-3 rounded hover:bg-red-700 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditUserDetails;
