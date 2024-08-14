import React from "react";
import Avater from "./Avater";
import { Link } from "react-router-dom";

function UserSearchCard({ user, onClose }) {
  return (
    <Link
      to={"/" + user?._id}
      onClick={onClose}
      className=" overflow-hidden hide_scrollbar overflow-x-scroll mt-2 flex items-center gap-4 p-2 border rounded  hover:border hover:border-pink-500 lg:p-4 border-transparent border-b-slate-200 cursor-pointer"
    >
      <div>
        <Avater
          width={50}
          height={40}
          imageUrl={user?.profile_pic}
          userId={user?._id}
        />
      </div>
      <div className="flex flex-row justify-between items-center w-full">
        <div>
          <div className="text-ellipsis line-clamp-1 font-bold">
            {user?.name}
          </div>
          <div className="text-ellipsis line-clamp-1">{user?.email}</div>
        </div>
        <div className="font-medium">{user?.phone}</div>
      </div>
    </Link>
  );
}

export default UserSearchCard;
