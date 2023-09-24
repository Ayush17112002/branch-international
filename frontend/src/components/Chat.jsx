import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import CustomerChatPage from "./CustomerChatPage";
import AgentChatPage from "./AgentChatPage";
const host = import.meta.env.VITE_BACKEND_URI;
import { io } from "socket.io-client";
const socket = io(import.meta.env.VITE_BACKEND_URI, { autoConnect: false });
export default function Chat() {
  const user = useSelector((state) => state.user);
  useEffect(() => {
    console.log(user.loggedIn);
    //make connection
    socket.connect();
    //emit user-id event and send userid
    socket.emit("user-id", user.id);
    console.log("id call");
    return () => {
      socket.disconnect();
    };
  }, []);
  return (
    <div
      className="chat-page w-screen h-screen"
      style={{
        backgroundImage: `url(https://d2c5ectx2y1vm9.cloudfront.net/assets/index/plants-2120f3eafc92bfda7a3c0562f0b5ea5f59e2791c332573a61e3038d8ae267d43.png)`,
        backgroundSize: "contain",
      }}
    >
      {user.type === "AGENT" && <AgentChatPage socket={socket} />}
      {user.type === "CUSTOMER" && <CustomerChatPage socket={socket} />}
    </div>
  );
}
