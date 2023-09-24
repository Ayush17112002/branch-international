import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { setMessages, addMessage, clearMessages } from "../redux/message";
import { setChats, addChat, removeCustomer } from "../redux/chat";
const host = import.meta.env.VITE_BACKEND_URI;
export default function AgentChatPage({ socket }) {
  const dispatch = useDispatch();
  const messages = useSelector((state) => state.message.messages);
  console.log(messages);
  const chats = useSelector((state) => state.chat.chats);
  const user = useSelector((state) => state.user);
  const [receiver, setReceiver] = useState(null);
  const [message, setMessage] = useState("");
  const submitHandler = async (e) => {
    e.preventDefault();
    const msg = message;
    setMessage("");
    try {
      if (msg.length === 0) {
        toast.error("Please type a message");
      } else {
        console.log("emit");
        socket.emit(
          "send-message",
          {
            from: user.id,
            text: msg,
            to: receiver,
          },
          (response) => {
            console.log(response);
            dispatch(addMessage(response));
          }
        );
      }
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    const getMessages = async () => {
      try {
        if (!receiver) {
          console.log("fdfd");
          dispatch(clearMessages());
          return;
        }
        const res = await axios({
          headers: { "Content-Type": "application/json" },
          method: "GET",
          url: `${host}/messages/${receiver}`,
        });
        console.log(res);
        dispatch(setMessages(res.data.data));
      } catch (err) {
        console.log(err);
        toast.error("Messages could not be loaded");
      }
    };
    getMessages();
  }, [receiver]);

  useEffect(() => {
    const getChats = async () => {
      try {
        const res = await axios({
          headers: { "Content-Type": "application/json" },
          method: "GET",
          url: `${host}/chats/${user.id}`,
        });
        console.log(res.data.data);
        dispatch(setChats(res.data.data));
      } catch (err) {
        console.log(err);
        toast.error("Chats could not be loaded");
      }
    };
    getChats();
  }, []);
  function onReceiveMessage(message) {
    console.log("rec listen", messages);
    if (receiver === String(message.from._id)) {
      console.log("rec listen", messages);
      dispatch(addMessage(message));
    }
  }
  useEffect(() => {
    function onReceiveMessage(message) {
      console.log("rec listen", message, receiver);
      if (receiver === String(message.from._id)) {
        console.log("rec listen", messages);
        dispatch(addMessage(message));
      }
    }
    function onAddChat(message) {
      console.log(message, "add");
      dispatch(addChat(message));
    }
    function onClose(customerId) {
      console.log(customerId, "onclode");
      if (String(customerId) === receiver) {
        setReceiver(null);
        dispatch(clearMessages());
      }
      dispatch(removeCustomer(customerId));
    }
    function onRemoveCustomer(id) {
      dispatch(removeCustomer(id));
    }
    socket.on("receive-message", onReceiveMessage);
    socket.on("add-chat", onAddChat);
    socket.on("close-chat", onClose);
    socket.on("remove-customer", onRemoveCustomer);
    return () => {
      socket.off("receive-message", onReceiveMessage);
      socket.off("add-chat", onAddChat);
      socket.off("close-chat", onClose);
      socket.off("remove-customer", onRemoveCustomer);
    };
  }, [receiver]);
  return (
    <div className="agent-chat-page absolute w-2/3 h-3/4 top-[12.5%] left-[12.5%] shadow-lg rounded-lg border-2 p-4 grid grid-cols-3 bg-slate-50">
      <div className="left-side relative flex flex-col justify-start border-2 overflow-auto rounded-lg">
        {chats.length > 0 &&
          chats.map((chat, index) => {
            console.log(chats);
            console.log(chat, "Fdf");
            return (
              <div key={index} className="flex flex-row justify-start">
                <div
                  key={index}
                  className="relative text-lg w-full mb-2 border-2 rounded-lg shadow-md"
                  onClick={(e) => {
                    e.preventDefault();
                    console.log(String(chat._id), chat._id);
                    setReceiver(String(chat._id));
                  }}
                >
                  <span>{chat.userName}</span>
                </div>
                <span className="relative right-0">
                  <button
                    type="submit"
                    className="text-xs"
                    onClick={(e) => {
                      dispatch(clearMessages());
                      setReceiver(null);
                      socket.emit("close", chat._id);
                    }}
                  >
                    🔴
                  </button>
                </span>
              </div>
            );
          })}
      </div>
      {receiver && (
        <div className="right-side ml-2 relative col-span-2">
          {chats.map((chat, index) => {
            if (chat._id === receiver) {
              return (
                <div
                  key={index}
                  className="w-full flex flex-row justify-center font-medium"
                >
                  Conversation with {chat.userName}
                </div>
              );
            }
          })}
          <div className="chats absolute overflow-auto h-[85%] w-full pl-3 pr-3">
            {messages.map((chat, index) => {
              const d = new Date(chat.createdAt);
              return (
                <div
                  key={index}
                  className={`relative flex flex-col mt-1 mb-1 w-full border-2 rounded-lg ${
                    receiver === chat.from._id ? "items-start" : "items-end"
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
          <form className="input absolute w-full bottom-1 h-[8%] grid grid-cols-5">
            <input
              type="text"
              className="col-span-4 border-2 pl-2 pr-2 rounded-lg"
              placeholder="Enter message..."
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
              }}
            />
            <button
              type="submit"
              className="rounded-xl bg-green-400 ml-2"
              onClick={submitHandler}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
