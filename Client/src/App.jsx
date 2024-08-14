import React from "react";
import './App.css'
import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";

function App(props) {
  return (
    <>
      <Toaster />
      
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default App;
