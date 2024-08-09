import React from "react";
import { Outlet } from "react-router-dom";

function Home(props) {
  return (
    <>
      Home
      <section>
        <Outlet />
      </section>
    </>
  );
}

export default Home;
