import React from "react";
import { Outlet } from "react-router-dom";

function App(props) {
  return (
    <main>
      <Outlet />
    </main>
  );
}

export default App;
