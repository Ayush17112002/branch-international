import socket from "../socket";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { setMessages, addMessage } from "../redux/message";
const host = import.meta.env.VITE_BACKEND_URI;
export default function CustomerChatPage() {
  const dispatch = useDispatch();
  const chats = useSelector((state) => state.message.messages);
  const user = useSelector((state) => state.user);
  const [message, setMessage] = useState("");
  const submitHandler = async (e) => {
    e.preventDefault();
    const msg = message;
    setMessage("");
    try {
      if (msg.length === 0) {
        toast.error("Please type a message");
      } else {
        socket.emit(
          "send-message",
          { from: user.id, text: msg },
          (response) => {
            dispatch(addMessage(response));
          }
        );
      }
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    const getChats = async () => {
      try {
        const res = await axios({
          headers: { "Content-Type": "application/json" },
          method: "GET",
          url: `${host}/messages/${user.id}`,
        });
        console.log(res);
        dispatch(setMessages(res.data.data));
      } catch (err) {
        toast.error("Messages could not be loaded");
      }
    };
    getChats();
  }, []);

  useEffect(() => {
    function onReceiveMessage(message) {
      console.log("rec listen", message);
      dispatch(addMessage(message));
    }
    socket.on("receive-message", onReceiveMessage);
    return () => {
      socket.off("receive-message", onReceiveMessage);
    };
  }, []);
  return (
    <div className="customer-chat-page absolute w-2/3 h-3/4 top-[12.5%] left-[12.5%] shadow-lg rounded-lg p-4 bg-slate-50">
      <div className="chats overflow-auto relative h-[90%] pl-3 pr-3 w-full">
        {chats.map((chat, index) => {
          const d = new Date(chat.createdAt);
          return (
            <div
              key={index}
              className={`relative flex flex-col mt-1 mb-1 w-full border-2 rounded-lg ${
                user.id === chat.from._id ? "items-end" : "items-start"
              }`}
            >
              <div className="text-xs font-bold">{chat.from.userName}</div>
              <div>{chat.message.text}</div>
              <div className="text-xs font-semibold">
                {d.toTimeString().substr(0, 8)}
              </div>
            </div>
          );
        })}
      </div>
      <div className="input absolute w-full bottom-4 pl-3 pr-9 h-[8%] grid grid-cols-5">
        <input
          type="text"
          className="col-span-4 border-2 pl-2 pr-2 rounded-lg"
          placeholder="Enter message..."
          onChange={(e) => {
            setMessage(e.target.value);
          }}
        />
        <button
          type="submit"
          className="rounded-xl bg-green-400"
          onClick={submitHandler}
        >
          Send
        </button>
      </div>
    </div>
  );
}
