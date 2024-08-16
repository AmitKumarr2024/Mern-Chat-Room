import React, { useMemo } from "react";
import { CgProfile } from "react-icons/cg";
import { useSelector } from "react-redux";

function Avater({ userId, imageUrl, name, height, width }) {
  const onlineUser = useSelector((state) => state?.user?.onlineUser);

  // Generate avatar initials from name
  const avatarName = useMemo(() => {
    if (name) {
      const splitName = name.split(" ");
      if (splitName.length > 1) {
        return splitName[0][0] + splitName[1][0];
      }
      return splitName[0][0];
    }
    return "";
  }, [name]);

  // Define background colors
  const bgColor = [
    "bg-slate-200",
    "bg-teal-200",
    "bg-red-200",
    "bg-green-200",
    "bg-yellow-200",
    "bg-gray-200",
    "bg-blue-200",
    "bg-indigo-200",
    "bg-purple-200",
    "bg-pink-200",
    "bg-rose-200",
    "bg-orange-200",
    "bg-amber-200",
    "bg-lime-200",
    "bg-emerald-200",
    "bg-cyan-200",
    "bg-sky-200",
    "bg-violet-200",
    "bg-fuchsia-200",
    "bg-rose-200",
  ];

  // Get a random background color
  const randomColor = useMemo(() => {
    return bgColor[Math.floor(Math.random() * bgColor.length)];
  }, []);

  // console.log("Current imageUrl:", imageUrl);

  // isOnline
  const isOnline = onlineUser.includes(userId);

 

  return (
    <div
      className={`text-slate-800 relative rounded-full flex items-center justify-center`}
      style={{ height: `${height}px`, width: `${width}px` }}
    >
      {imageUrl ? (
        <div
          className="relative flex items-center justify-center"
          style={{ width: `${width}px`, height: `${height}px` }}
        >
          <img
            src={imageUrl}
            alt={name || "Avatar"}
            className="w-full h-full object-fill rounded-full"
            style={{ borderRadius: "50%" }} // Ensure the image is circular
          />
        </div>
      ) : name ? (
        <div
          className={`flex uppercase items-center justify-center overflow-hidden text-2xl font-medium rounded-full ${bgColor[randomColor]}`}
          style={{ height: `${height}px`, width: `${width}px` }}
        >
          {avatarName}
        </div>
      ) : (
        <CgProfile size={Math.min(height, width) * 0.6} />
      )}

      {isOnline && (
        <div
          className={`absolute bottom-0 right-0 z-50 ${
            isOnline
              ? "w-4 h-4 bg-green-700 border-4 border-green-600 animate-blink"
              : "w-3 h-3 bg-green-700 border-4 border-green-600"
          } rounded-full`}
          style={{
            transform: "translate(60%, 50%)",
            boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.2)", // Optional: for better visibility
          }}
          title="Online"
        />
      )}
    </div>
  );
}

export default Avater;
