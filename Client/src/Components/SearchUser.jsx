import React, { useEffect, useState } from "react";
import { FcSearch } from "react-icons/fc";
import Loading from "./Loading";
import UserSearchCard from "./UserSearchCard";
import toast from "react-hot-toast";
import axios from "axios";
import UserApi from "../common/user_url";
import { IoClose } from "react-icons/io5";

function SearchUser({ onClose }) {
  const [searchUser, setSearchUser] = useState([]);
  const [loading, setLoading] = useState(false); // Initially, no loading
  const [search, setSearch] = useState("");

  // function for search
  const handleSearchUser = async (e) => {
    setLoading(true); // Start loading
    try {
      const response = await axios({
        method: "post",
        url: UserApi.userSearch.url,
        data: { search }, // Send search query
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });

      setSearchUser(response.data.data);
      console.log("Search result", response.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  useEffect(() => {
    if (search) {
      handleSearchUser();
    } else {
      setSearchUser([]); // Clear search results if search is empty
    }
  }, [search]);

  console.log("search---User:", searchUser);

  return (
    <div className="fixed inset-7 bg-opacity-70 top-0 bottom-0 right-0 left-0 flex justify-center items-start bg-gray-700 p-4 z-50">
      <div className="relative mt-20 w-full max-w-lg mx-auto">
        {/* close search button */}
        <div onClick={onClose} className="absolute -right-2 -top-10 md:-right-8 md:-top-9 text-slate-100 hover:text-red-600" title="close">
          <button >
            <IoClose size={35}/>
          </button>
        </div>
        {/* input bar */}
        <div className="bg-white rounded h-14 overflow-hidden flex">
          <input
            type="text"
            placeholder="Search user by name, email..."
            className="w-full outline-none py-1 h-full px-4"
            onChange={(e) => setSearch(e.target.value)}
            value={search}
          />
          <div className="h-14 w-14 flex justify-center items-center cursor-pointer">
            <FcSearch size={35} />
          </div>
        </div>
        {/* display search user */}
        <div className="bg-white mt-2 rounded w-full p-4">
          {/* no user found */}
          {searchUser.length === 0 && !loading && search && (
            <p className="text-center text-slate-500">No user found!</p>
          )}
          {loading && (
            <div className="text-center">
              <Loading />
            </div>
          )}
          {searchUser.length !== 0 &&
            !loading &&
            searchUser.map((user) => {
              return (
                <UserSearchCard key={user._id} user={user} onClose={onClose} />
              );
            })}
        </div>
      </div>
    </div>
  );
}

export default SearchUser;
