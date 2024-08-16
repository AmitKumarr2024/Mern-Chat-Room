import React, { useEffect, useState } from "react";
import { PiChatCircleTextFill } from "react-icons/pi";
import { LiaUserPlusSolid } from "react-icons/lia";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ImExit } from "react-icons/im";
import Avater from "./Avater";
import { useDispatch, useSelector } from "react-redux";
import EditUserDetails from "./EditUserDetails";
import { HiOutlineArrowLeft } from "react-icons/hi2";
import SearchUser from "./SearchUser";
import { FaImage } from "react-icons/fa6";
import { MdVideoChat } from "react-icons/md";
import { logout } from "../redux/userSlice";

function Section(props) {
  const user = useSelector((state) => state?.user);
  const socketConnection = useSelector((state) => state?.user?.socketConnection);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [allUser, setAllUser] = useState([]);
  const [openSearchUser, setOpenSearchUser] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (socketConnection && user?._id) {
      socketConnection.emit("sidebar", user._id);

      socketConnection.on("conversation", (data) => {
        const updatedConversations = data.reduce((acc, conversationUser) => {
          const senderId = conversationUser?.sender?._id;
          const receiverId = conversationUser?.receiver?._id;

          if (!senderId || !receiverId) return acc;

          const pairKey = [senderId, receiverId].sort().join("-");

          const existingIndex = acc.findIndex((conv) => {
            const existingKey = [conv.sender._id, conv.receiver._id]
              .sort()
              .join("-");
            return existingKey === pairKey;
          });

          if (existingIndex > -1) {
            acc[existingIndex] = {
              ...acc[existingIndex],
              ...conversationUser,
              userDetails:
                senderId === user._id
                  ? conversationUser.receiver
                  : conversationUser.sender,
            };
          } else {
            acc.push({
              ...conversationUser,
              userDetails:
                senderId === user._id
                  ? conversationUser.receiver
                  : conversationUser.sender,
            });
          }

          return acc;
        }, []);

        setAllUser(updatedConversations);
      });
    }

    return () => {
      if (socketConnection) {
        socketConnection.off("conversation");
      }
    };
  }, [socketConnection, user]);

  const handleLogOut = () => {
    dispatch(logout());
    navigate("/login");
    localStorage.clear();
  };

  return (
    <div className="w-full h-full grid grid-cols-[50px,1fr] bg-white">
      <div className="bg-slate-100 w-12 h-full rounded-tr-lg rounded-br-lg py-5 text-slate-600 flex flex-col justify-between">
        <div>
          <NavLink
            to={"/"}
            className={({ isActive }) =>
              `w-12 h-12 flex justify-center items-center hover:bg-slate-200 cursor-pointer rounded ${
                isActive && "bg-slate-200"
              }`
            }
            title="ChatRoom"
          >
            <PiChatCircleTextFill size={30} />
          </NavLink>
          <div
            className="mt-1 w-12 h-12 flex justify-center items-center hover:bg-slate-200 cursor-pointer rounded"
            title="Add friend"
            onClick={() => setOpenSearchUser(true)}
          >
            <LiaUserPlusSolid size={30} />
          </div>
        </div>
        <div className="flex flex-col items-center">
          <button
            className="w-12 h-12 flex justify-center items-center hover:bg-slate-200 cursor-pointer rounded"
            title={user.name ? user.name : "Profile"}
            onClick={() => setEditUserOpen(true)}
          >
            <Avater
              width={30}
              height={30}
              name={user?.name}
              imageUrl={user?.profile_pic}
              userId={user?._id}
            />
          </button>
          <div
            className="w-12 h-12 flex justify-center items-center hover:bg-slate-200 cursor-pointer rounded"
            onClick={handleLogOut}
            title="Logout"
          >
            <span className="ml-2">
              <ImExit size={30} />
            </span>
          </div>
        </div>
      </div>
      <div className="w-full">
        <div className="h-16 flex item-center">
          <h2 className="text-xl font-bold p-4 text-slate-800">Message</h2>
        </div>
        <div className="bg-slate-200 p-[0.5px]"></div>
        <div className="h-[calc(100vh-65px)] hide_scrollbar overflow-x-hidden overflow-y-scroll">
          {allUser.length === 0 && (
            <div className="mt-2">
              <div className="flex ml-16 text-sky-500 justify-start items-start my-4 animate-ping">
                <HiOutlineArrowLeft size={30} />
              </div>
              <p className="text-base text-slate-500 text-center">
                Explore Users to Start a Conversation with.
              </p>
            </div>
          )}
          {allUser.map((conv, index) => (
            <NavLink
              to={"/" + conv?.userDetails?._id}
              key={conv?._id}
              className="flex items-center gap-1 flex-col w-full"
            >
              <p className="text-xs text-blue-500 font-bold text-ellipsis line-clamp-1">
                {new Date(conv?.lastMsg?.createdAt).toLocaleString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour12: true,
                })}
              </p>
              <div className="flex items-center gap-1 w-full px-1 border-2 border-transparent  mb-3  hover:border-green-600 rounded hover:bg-slate-200 transition-all duration-100">
                <div>
                  <Avater
                    height={40}
                    width={40}
                    imageUrl={conv?.userDetails?.profile_pic}
                    name={conv?.userDetails?.name}
                  />
                </div>
                <div className="flex items-center justify-between w-full px-1">
                  <div>
                    <h3 className="text-ellipsis line-clamp-1 font-bold">
                      {conv?.userDetails?.name}
                    </h3>
                    <div className="flex gap-2 text-ellipsis line-clamp-1 text-sm text-slate-500 py-1">
                      {conv?.lastMsg?.imageUrl && (
                        <div className="flex gap-1 items-center text-sm">
                          <span>
                            <FaImage size={25} />
                          </span>
                          {!conv?.lastMsg.text && <span>Image</span>}
                        </div>
                      )}
                      {conv?.lastMsg?.videoUrl && (
                        <div className="flex flex-row gap-1 items-center text-sm">
                          <span>
                            <MdVideoChat size={25} />
                          </span>
                          {!conv?.lastMsg?.text && <span>Video</span>}
                        </div>
                      )}
                      <p>{conv?.lastMsg?.text}</p>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-400">
                      {new Date(conv?.lastMsg?.createdAt).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        }
                      )}
                    </span>
                    {Boolean(conv?.unseenMsg) && (
                      <p className="text-xs w-5 h-5 ml-auto flex justify-center items-center bg-red-500 font-semibold text-white p-2 rounded-full line-clamp-1 text-ellipsis">
                        {conv?.unseenMsg}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </NavLink>
          ))}
        </div>
      </div>
      {editUserOpen && (
        <EditUserDetails onClose={() => setEditUserOpen(false)} />
      )}
      {openSearchUser && (
        <SearchUser onClose={() => setOpenSearchUser(false)} />
      )}
    </div>
  );
}

export default Section;
