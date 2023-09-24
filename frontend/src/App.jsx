import { useEffect, useState } from "react";
import "./App.css";
import { ToastContainer } from "react-toastify";
import Login from "./components/Login";
import "react-toastify/dist/ReactToastify.css";
import { useSelector, useDispatch } from "react-redux";
import Chat from "./components/Chat";

const App = ({ type }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  return (
    <div className="app">
      {!user.loggedIn ? <Login type={type} /> : <Chat />}
      <ToastContainer />
    </div>
  );
};

export default App;
