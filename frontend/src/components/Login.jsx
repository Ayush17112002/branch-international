import { useEffect, useState } from "react";
import { login } from "../redux/user";
import { toast } from "react-toastify";
import axios from "axios";
import socket from "../socket";
import { useSelector, useDispatch } from "react-redux";
const host = import.meta.env.VITE_BACKEND_URI;
const Login = ({ type }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [userName, setUserName] = useState("");

  function inputHandler(e) {
    setUserName(e.target.value);
  }

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await axios({
        headers: { "Content-Type": "application/json" },
        method: "POST",
        url: `${host}/login`,
        data: {
          userName,
          type,
        },
      });
      const data = res.data.data;
      dispatch(
        login({ userName: data.userName, id: data.id, type: data.type })
      );
    } catch (err) {
      toast.error("INTERNAL SERVER ERROR");
    }
  };
  return (
    <div
      className="login w-screen h-screen"
      style={{
        backgroundImage: `url(https://d2c5ectx2y1vm9.cloudfront.net/assets/index_local/index_local_hero.en_IN-5f305f0dd4cd806ca235e8acc50ab73435cc235996513300052facf485b1437f.png)`,
        backgroundSize: "contain",
      }}
    >
      <form
        className="login-form flex flex-col absolute justify-start items-center top-1/4 left-8 w-1/3 h-1/2 rounded-md shadow-lg"
        id="login-form"
      >
        <h1 className="logo text-2xl font-bold">{type} LOGIN PORTAL</h1>

        <input
          type="text"
          className="mt-8 relative pl-2 pr-2 ml-4 mr-4 rounded-md h-8 w-[80%]"
          onChange={inputHandler}
          placeholder={type === "CUSTOMER" ? `Enter 7812` : `Enter agent`}
        ></input>

        <button
          type="submit"
          className="rounded-md w-20 h-8 mt-4 bg-white"
          onClick={submitHandler}
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
