import { useEffect, useState } from "react";
import "./App.css";
import { ToastContainer } from "react-toastify";
import Login from "./components/Login";
import "react-toastify/dist/ReactToastify.css";

// import { io } from "socket.io-client";
// const socket = io(import.meta.env.VITE_BACKEND_URI, { autoConnect: false });

const App = () => {
  return (
    <div className="app">
      <Login />
      <ToastContainer />
    </div>
  );
};

export default App;
