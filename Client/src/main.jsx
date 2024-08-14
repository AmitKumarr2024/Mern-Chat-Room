import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import router from "./Router/index.jsx";
import { Provider } from "react-redux";
import { store } from "./redux/store.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} future={{ v7_startTransition: true }}>
        <App />
      </RouterProvider>
    </Provider>
  </React.StrictMode>
);
