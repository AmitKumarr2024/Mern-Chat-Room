import React, { useState } from "react";
import { PiChatCircleTextFill } from "react-icons/pi";
import { LiaUserPlusSolid } from "react-icons/lia";
import { Link, NavLink } from "react-router-dom";
import { ImExit } from "react-icons/im";
import Avater from "./Avater";
import { useSelector } from "react-redux";
import EditUserDetails from "./EditUserDetails";
import { HiOutlineArrowLeft } from "react-icons/hi2";
import SearchUser from "./SearchUser";

function Section(props) {
  const user = useSelector((state) => state?.user);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [allUser, setAllUser] = useState([]);
  const [openSearchUser, setOpenSearchUser] = useState(false);

  return (
    <div className="w-full h-full grid grid-cols-[50px,1fr] bg-white">
      <div className="bg-slate-100 w-12 h-full rounded-tr-lg rounded-br-lg py-5 text-slate-600  flex flex-col justify-between">
        <div>
          <NavLink
            className={({ isActive }) =>
              `w-12 h-12 flex justify-center items-center hover:bg-slate-200 cursor-pointer rounded ${
                isActive && "bg-slate-200"
              }`
            }
            title="ChatRoom"
          >
            <PiChatCircleTextFill size={30} />
          </NavLink>
          {/* add friend */}
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

          {/* logout */}
          <Link
            to={"/register"}
            className="w-12 h-12 flex justify-center items-center hover:bg-slate-200 cursor-pointer rounded"
            title="Logout"
          >
            <span className="ml-2">
              <ImExit size={30} />
            </span>
          </Link>
        </div>
      </div>
      <div className="w-full  ">
        <div className="h-16 flex item-center">
          <h2 className="text-xl font-bold p-4 text-slate-800">Message</h2>
        </div>
        <div className="bg-slate-200 p-[0.5px]"></div>
        <div className=" h-[calc(100vh-65px)] hide_scrollbar overflow-x-hidden overflow-y-scroll ">
          {allUser.length === 0 && (
            <div className="mt-2">
              <div className="flex ml-16 text-sky-500  justify-start items-start  my-4 animate-ping">
                <HiOutlineArrowLeft size={30} />
              </div>
              <p className="text-base text-slate-500 text-center ">
                Explore Users to Start a Converstation with.
              </p>
            </div>
          )}
        </div>
      </div>
      {/* edite user box */}
      {editUserOpen && (
        <EditUserDetails onClose={() => setEditUserOpen(false)} />
      )}
      {/* search User */}
      {openSearchUser && (
        <SearchUser onClose={() => setOpenSearchUser(false)} />
      )}
    </div>
  );
}

export default Section;
