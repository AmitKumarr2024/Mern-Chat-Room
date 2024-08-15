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
        console.log("Scrolling to the latest message...");
        currentMessage.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }
    }, 100); // Adjust the delay as needed
  }, [allMessage]);

  useEffect(() => {
    if (socketConnection) {
      console.log("Socket connection established. Emitting events...");
      socketConnection.emit("message-page", params?.userId);
      socketConnection.emit("seen", params?.userId);
      
      socketConnection.on("message-user", (data) => {
        console.log("Received user data:", data);
        setUserData(data);
      });

      socketConnection.on("message", (data) => {
        console.log("Received messages:", data);
        setAllMessage(data);
      });
    }
  }, [socketConnection, params?.userId, user]);

  const handleToggleAttachment = () => {
    setOpenAttachment((prev) => !prev);
    console.log("Attachment menu toggled. Open status:", !openAttachment);
  };

  const handleUploadVideo = useCallback(async (e) => {
    const file = e.target.files[0];
    console.log("Selected video file:", file);

    const validVideoTypes = [
      "video/mp4",
      "video/avi",
      "video/mov",
      "video/mkv",
    ];
    const maxSize = 30485760; // 10 MB in bytes

    if (!validVideoTypes.includes(file.type)) {
      alert("Invalid file type. Please select a valid video file.");
      console.warn("Invalid video file type:", file.type);
      return;
    }

    if (file.size > maxSize) {
      alert("File size too large. Please select a file under 10 MB.");
      console.warn("File size too large:", file.size);
      return;
    }

    try {
      setLoading(true);
      const uploadPhoto = await uploadFile(file);
      console.log("Uploaded video URL:", uploadPhoto.url);
      
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
    console.log("Closing video upload. Resetting video URL...");
    setMessage((prev) => ({
      ...prev,
      videoUrl: "",
    }));
  };

  const handleUploadImage = useCallback(async (e) => {
    setLoading(true);
    const file = e.target.files[0];
    console.log("Selected image file:", file);

    try {
      const uploadPhoto = await uploadFile(file);
      console.log("Uploaded Image URL:", uploadPhoto.url);

      setMessage((prev) => ({
        ...prev,
        imageUrl: uploadPhoto.url,
      }));
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setLoading(false);
      setOpenAttachment(false);
    }
  }, []);

  const handleClearUploadImage = () => {
    console.log("Clearing uploaded image...");
    setMessage((prev) => ({
      ...prev,
      image: null,
    }));
  };

  const handleOnChangeText = (e) => {
    const { name, value } = e.target;

    setMessage((prev) => {
      console.log("Updating message text:", value);
      return {
        ...prev,
        text: value,
      };
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();

    console.log("Sending message:", message);

    if (message?.text || message?.imageUrl || message?.videoUrl) {
      if (socketConnection) {
        console.log("Emitting new message to socket...");
        socketConnection.emit("new-message", {
          sender: user?._id,
          receiver: params?.userId,
          text: message?.text || "",
          imageUrl: message?.imageUrl || "",
          videoUrl: message?.videoUrl || "",
          msgByUserId: user?._id,
        });

        setMessage({
          text: "",
          imageUrl: "",
          videoUrl: "",
        });
      }
    } else {
      console.warn("No content to send");
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
                      sameDay: "[Today]",
                      lastDay: "[Yesterday]",
                      lastWeek: "[Last] dddd",
                      sameElse: "dddd, MMMM D, YYYY",
                    })}
                  </p>
                )}
                <div className="flex gap-2">
                  <div
                    className={`flex items-center gap-2 ${
                      msg?.sender === user?._id ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg?.sender !== user?._id && (
                      <div className="flex-shrink-0">
                        <Avater
                          width={40}
                          height={40}
                          imageUrl={userData?.profile_pic}
                          online={userData?.online}
                          name={userData?.name}
                        />
                      </div>
                    )}
                    <div
                      className={`flex flex-col gap-2 ${
                        msg?.sender === user?._id ? "items-end" : "items-start"
                      }`}
                    >
                      {msg?.text && <p>{msg?.text}</p>}
                      {msg?.imageUrl && (
                        <img
                          src={msg?.imageUrl}
                          className="w-32 h-32 object-cover rounded-lg"
                          alt="Message"
                        />
                      )}
                      {msg?.videoUrl && (
                        <video
                          className="w-32 h-32 object-cover rounded-lg"
                          controls
                        >
                          <source src={msg?.videoUrl} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="fixed bottom-0 w-full bg-white py-2 px-4 shadow-md">
        <form className="flex items-center gap-2" onSubmit={handleSendMessage}>
          <button
            type="button"
            onClick={handleToggleAttachment}
            className="p-2 text-gray-600"
          >
            <RiAttachment2 />
          </button>
          <input
            type="text"
            name="text"
            value={message.text}
            onChange={handleOnChangeText}
            placeholder="Type a message"
            className="w-full p-2 border rounded-lg"
          />
          {message.imageUrl && (
            <div className="relative">
              <img
                src={message.imageUrl}
                alt="Selected"
                className="w-32 h-32 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={handleClearUploadImage}
                className="absolute top-0 right-0 p-1 bg-red-600 text-white rounded-full"
              >
                <IoMdClose />
              </button>
            </div>
          )}
          {message.videoUrl && (
            <div className="relative">
              <video
                className="w-32 h-32 object-cover rounded-lg"
                controls
              >
                <source src={message.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <button
                type="button"
                onClick={handleCloseUploadVideo}
                className="absolute top-0 right-0 p-1 bg-red-600 text-white rounded-full"
              >
                <IoMdClose />
              </button>
            </div>
          )}
          <button
            type="submit"
            className="p-2 bg-blue-600 text-white rounded-full"
          >
            <RiSendPlane2Line />
          </button>
        </form>

        {/* Attachment menu */}
        {openAttachment && (
          <div className="flex gap-2 mt-2">
            <label className="p-2 cursor-pointer text-blue-600 flex flex-col items-center">
              <IoImageSharp size={25} />
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadImage}
                className="hidden"
              />
              Image
            </label>
            <label className="p-2 cursor-pointer text-blue-600 flex flex-col items-center">
              <IoVideocam size={25} />
              <input
                type="file"
                accept="video/*"
                onChange={handleUploadVideo}
                className="hidden"
              />
              Video
            </label>
          </div>
        )}

        {loading && <Loading />}
      </div>
    </div>
  );
});

export default MessageSection;
