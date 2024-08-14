import React from "react";
import Logo from "../Assets/logo.svg";
import Logo2 from "../Assets/chatmeapp2.jpg";

function AuthLayout({ children }) {
  return (
    <>
      <header className="flex justify-center items-center py-1 h-20 shadow-md ">
        <img
          src={Logo2}
          width={70}
          height={60}
          alt="logo"
          className="rounded-3xl "
        />
      </header>
      {children}
    </>
  );
}

export default AuthLayout;
