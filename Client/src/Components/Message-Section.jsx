import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import Avater from "./Avater";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaArrowLeft } from "react-icons/fa6";
import { RiAttachment2 } from "react-icons/ri";
import { IoVideocam, IoImageSharp } from "react-icons/io5";
import uploadFile from "../helper/uploadCloudinary";
import { IoMdClose } from "react-icons/io";
import Loading from "./Loading";
import Wallpapers from "/wallpaper.jpg";
import { RiSendPlane2Line } from "react-icons/ri";
import moment from "moment";

const MessageSection = React.memo(() => {
  const params = useParams();
  const socketConnection = useSelector(
    (state) => state?.user?.socketConnection
  );
  const user = useSelector((state) => state?.user);
  const [loading, setLoading] = useState(false);

  const [userData, setUserData] = useState({
    _id: "",
    name: "",
    email: "",
    phone: "",
    profile_pic: "",
    online: false,
  });

  const [message, setMessage] = useState({
    text: "",
    imageUrl: "",
    videoUrl: "", // Corrected typo from 'vide' to 'video'
  });
  const [allMessage, setAllMessage] = useState([]);

  const [openAttachment, setOpenAttachment] = useState(false);

  const currentMessage = useRef();

  useEffect(() => {
    setTimeout(() => {
      if (currentMessage.current) {
        currentMessage.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }
    }, 100); // Adjust the delay as needed
  }, [allMessage]);
  useEffect(() => {
    if (socketConnection) {
      socketConnection.emit("message-page", params?.userId);
      socketConnection.emit("seen", params?.userId);
      socketConnection.on("message-user", (data) => {
        setUserData(data);
      });
      socketConnection.on("message", (data) => {
        setAllMessage(data);
      });
    }
  }, [socketConnection, params?.userId, user]);

  // Memoized function to toggle the attachment menu
  const handleToggleAttachment = () => {
    setOpenAttachment((prev) => !prev);
  };

  // Memoized function for video upload
  const handleUploadVideo = useCallback(async (e) => {
    const file = e.target.files[0];
    const validVideoTypes = [
      "video/mp4",
      "video/avi",
      "video/mov",
      "video/mkv",
    ];
    const maxSize = 30485760; // 10 MB in bytes

    if (!validVideoTypes.includes(file.type)) {
      alert("Invalid file type. Please select a valid video file.");
      return;
    }

    if (file.size > maxSize) {
      alert("File size too large. Please select a file under 10 MB.");
      return;
    }

    try {
      setLoading(true);
      const uploadPhoto = await uploadFile(file);
      setMessage((prev) => ({
        ...prev,
        videoUrl: uploadPhoto.url,
      }));
      setOpenAttachment(false);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload video. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCloseUploadVideo = () => {
    setMessage((prev) => ({
      ...prev,
      videoUrl: "",
    }));
  };

  // Memoized function for image upload
  const handleUploadImage = useCallback(async (e) => {
    setLoading(true);
    const file = e.target.files[0];

    try {
      const uploadPhoto = await uploadFile(file);
      console.log("Uploaded Image URL:", uploadPhoto.url); // Verify URL

      setMessage((prev) => ({
        ...prev,
        imageUrl: uploadPhoto.url, // Set the correct image URL
      }));
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setLoading(false);
      setOpenAttachment(false);
    }
  }, []);

  const handleClearUploadImage = () => {
    setMessage((prev) => ({
      ...prev,
      image: null,
    }));
  };

  const handleOnChangeText = (e) => {
    const { name, value } = e.target;

    setMessage((prev) => {
      return {
        ...prev,
        text: value,
      };
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();

    // Debugging: Log the current message state before sending
    console.log("Sending message:", message);

    if (message?.text || message?.imageUrl || message?.videoUrl) {
      if (socketConnection) {
        socketConnection.emit("new-message", {
          sender: user?._id,
          receiver: params?.userId,
          text: message?.text || "", // Send empty text if only image/video
          imageUrl: message?.imageUrl || "", // Ensure to send image URL
          videoUrl: message?.videoUrl || "", // Ensure to send video URL
          msgByUserId: user?._id,
        });

        // Clear the message state after sending
        setMessage({
          text: "",
          imageUrl: "", // Reset image URL after sending
          videoUrl: "", // Reset video URL after sending
        });
      }
    } else {
      console.warn("No content to send"); // Handle case where no message is present
    }
  };

  return (
    <div
      style={{ backgroundImage: `url(${Wallpapers})` }}
      className="bg-no-repeat bg-cover bg-center "
    >
      <header className="sticky top-0 h-20 bg-indigo-100 shadow-md flex items-center px-4">
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to={"/"} className="lg:hidden block">
              <FaArrowLeft size={20} />
            </Link>
            <div className="flex-shrink-0">
              <Avater
                width={60}
                height={60}
                imageUrl={userData?.profile_pic}
                online={userData?.online}
                name={userData?.name}
                userId={userData?._id}
              />
            </div>
            <div className="text-gray-600">
              <h3 className="text-xl font-bold line-clamp-1 text-ellipsis">
                {userData?.name}
              </h3>
              <p className="text-xs font-medium">{userData?.phone}</p>
              <p className="text-sm opacity-80">
                {userData?.online ? (
                  <span className="text-green-600 font-bold">Online</span>
                ) : (
                  <span className="text-red-600 font-bold">Offline</span>
                )}
              </p>
            </div>
          </div>
          <div className="hover:text-sky-500">
            <BsThreeDotsVertical size={25} />
          </div>
        </div>
      </header>

      <section className="h-[calc(100vh-145px)] overflow-x-hidden overflow-y-scroll hide_scrollbar your-scroll-container bg-slate-300 bg-opacity-90">
        {/* message */}
        <div className="flex flex-col justify-between gap-2 px-3">
          {allMessage.map((msg, index) => {
            const isLastMessage = index === allMessage.length - 1;

            // Get the current message's date and the previous message's date
            const currentMessageDate = moment(msg.createdAt).format("LL"); // Example: "August 14, 2024"
            const previousMessageDate =
              index > 0
                ? moment(allMessage[index - 1].createdAt).format("LL")
                : null;

            // Check if the current message date is different from the previous one
            const isNewDay = currentMessageDate !== previousMessageDate;

            return (
              <div key={msg._id} ref={isLastMessage ? currentMessage : null}>
                {/* If it's a new day, display the date */}
                {isNewDay && (
                  <p className="text-center text-sm text-gray-500 font-semibold my-2">
                    {moment(msg.createdAt).calendar(null, {
                      sameDay: "[Today]", // Today
                      lastDay: "[Yesterday]", // Yesterday
                      lastWeek: "dddd", // Last Monday, etc.
                      sameElse: "MMMM D, YYYY", // August 14, 2024, etc.
                    })}
                  </p>
                )}

                {/* Message content */}
                <div
                  className={` your-scroll-container py-1 w-fit rounded-lg ${
                    user?._id === msg?.msgByUserId
                      ? "ml-auto bg-indigo-400 text-slate-100 mb-2"
                      : "bg-white"
                  }`}
                >
                  <div className="w-full max-w-sm mx-auto">
                    {msg?.imageUrl && (
                      <img
                        src={msg?.imageUrl}
                        className="w-full h-auto max-h-96 object-scale-down"
                        alt="Message Image"
                      />
                    )}

                    {msg?.videoUrl && (
                      <video
                        src={msg?.videoUrl}
                        className="w-full h-auto max-h-96 object-scale-down"
                        controls
                        muted
                        autoPlay
                      />
                    )}
                  </div>

                  <p className="px-3">{msg.text}</p>
                  <p className="text-xs font-medium text-gray-700 ml-auto w-fit px-1">
                    {moment(msg.createdAt).format("LT")} {/* Time */}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* below button */}
      <section className="h-16 px-6 flex gap-4 items-center bg-white">
        <div className="relative">
          <button
            onClick={handleToggleAttachment}
            className="flex justify-center items-center hover:text-blue-500 cursor-pointer"
          >
            <RiAttachment2 size={30} />
          </button>

          {openAttachment && (
            <div className="bg-white shadow rounded absolute bottom-[40px] w-28 p-2">
              <form>
                <label
                  htmlFor="video"
                  className="flex justify-center items-center p-1 my-1 gap-3 hover:bg-slate-200 cursor-pointer"
                >
                  <div className="text-violet-700">
                    <IoVideocam size={25} />
                  </div>
                  <p>Video</p>
                </label>
                <label
                  htmlFor="image"
                  className="flex justify-center items-center p-1 gap-3 hover:bg-slate-200 cursor-pointer"
                >
                  <div className="text-orange-700">
                    <IoImageSharp size={25} />
                  </div>
                  <p>Image</p>
                </label>
                <input
                  type="file"
                  id="video"
                  onChange={handleUploadVideo}
                  className="hidden"
                />
                <input
                  type="file"
                  id="image"
                  onChange={handleUploadImage}
                  className="hidden"
                />
              </form>
            </div>
          )}
        </div>
        {/* input */}
        <form
          className="h-full w-full flex items-center gap-4"
          onSubmit={handleSendMessage}
        >
          <input
            type="text"
            placeholder="Type Your message..."
            className="py-1 px-4 outline-none  w-full h-full"
            value={message?.text}
            onChange={handleOnChangeText}
          />
          <button className="text-green-600 hover:bg-blue-500 hover:text-white hover:rounded-full p-2">
            <RiSendPlane2Line size={30} />
          </button>
        </form>
      </section>
    </div>
  );
});

export default MessageSection;
