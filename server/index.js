const express = require("express");
const cors = require("cors");
const app = express();
const server = require("http").createServer(app);
app.use(cors());
app.use(express.json());
require("dotenv").config();
require("./db/config");
app.post("/login", require("./controllers/login.controller").login);
app.get("/messages/:id", require("./controllers/chat.controller").getMessages);
app.get("/chats/:id", require("./controllers/chat.controller").getChats);
server.listen(process.env.SERVER_PORT, (err) => {
  if (err) {
    console.log("Error in running the server");
  } else {
    console.log(`Server is running at port ${process.env.SERVER_PORT}`);
  }
});
// module.exports = server;
const socket = require("socket.io");
//const server = require("../index");
const User = require("./models/user.model");
const Chat = require("./models/chat.model");
const io = socket(server, { cors: "*" });
const customer = new Map();
const agent = new Map();
const rev_customer = new Map();
const rev_agent = new Map();

io.on("connection", (socket) => {
  socket.on("user-id", async (userId) => {
    try {
      //assign agent
      //set connection of both customer and agent
      const agents = await User.find({ type: "AGENT" });
      const myUser = await User.findById(userId);
      if (myUser && myUser.type === "CUSTOMER") {
        customer.set(userId, socket.id);
        rev_customer.set(socket.id, userId);
        if (myUser.connection.size > 0 && agent.has(myUser.connection[0])) {
          //do nothing
        } else {
          let min_connections = { count: -1, id: "" };
          agents.forEach((item) => {
            if (agent.size > 0 && agent.has(item.id)) {
              if (min_connections.count == -1)
                min_connections = {
                  count: item.connection.length,
                  id: item.id,
                };
              else if (item.connection.length < min_connections.count)
                min_connections = {
                  count: item.connection.length,
                  id: item.id,
                };
            }
            if (agent.size === 0) {
              if (min_connections.count == -1)
                min_connections = {
                  count: item.connection.length,
                  id: item.id,
                };
              else if (item.connection.length < min_connections.count)
                min_connections = {
                  count: item.connection.length,
                  id: item.id,
                };
            }
          });
          let b = false;
          if (myUser.connection.size > 0) {
            if (myUser.connection[0] === min_connections.id) b = true;
            //close previous connection
            await User.findByIdAndUpdate(myUser.connection[0], {
              $pull: { connection: myUser.id },
            });
          }
          myUser.connection = min_connections.id;
          await myUser.save();
          const Agent = await User.findByIdAndUpdate(min_connections.id, {
            $addToSet: { connection: userId },
          });
          if (!b) {
            console.log(agent.get(min_connections.id), agent);
            io.to(agent.get(min_connections.id)).emit("add-chat", myUser);
          }
        }
      } else if (myUser && myUser.type === "AGENT") {
        //only add into map
        agent.set(userId, socket.id);
        rev_agent.set(socket.id, userId);
      } else {
        throw new Error("DB ERROR");
      }
    } catch (err) {
      console.log(err);
    }
  });
  socket.on("disconnect", () => {
    if (rev_agent.has(socket.id)) {
      agent.delete(rev_agent.get(socket.id));
      rev_agent.delete(socket.id);
    }
    if (rev_customer.has(socket.id)) {
      customer.delete(rev_customer.get(socket.id));
      rev_customer.delete(socket.id);
    }
  });
  socket.on("send-message", async (message, callback) => {
    try {
      console.log(message);
      if (rev_agent.has(socket.id)) {
        //agent is sending message
        const fun = {
          message: { text: message?.text },
          from: message.from,
          to: message.to,
        };
        const newChat = new Chat(fun);
        await newChat.save();
        const res = await Chat.findById(newChat._id)
          .populate("from")
          .populate("to");
        callback(res);
        io.to(customer.get(message.to)).emit("receive-message", res);
      } else {
        //customer is sending message
        const fun = {
          message: { text: message?.text },
          from: message.from,
        };
        const user = await User.findById(message.from);
        fun.to = String(user.connection[0]);
        console.log(fun);
        const newChat = new Chat(fun);
        await newChat.save();
        const res = await Chat.findById(newChat._id)
          .populate("from")
          .populate("to");
        console.log(newChat);
        callback(res);
        io.to(agent.get(fun.to)).emit("receive-message", res);
        const agentInfo = await User.findById(fun.to);
        let b = false;
        agentInfo.connection.forEach((id) => {
          if (String(id) === fun.from) b = true;
        });
        if (!b) {
          agentInfo.connection.push(fun.from);
          await agentInfo.save();
          io.to(agent.get(fun.to)).emit("add-chat", res);
        }
      }
    } catch (err) {
      console.log(err);
    }
  });
  socket.on("close", async (customerId) => {
    try {
      const agentId = rev_agent.get(socket.id);
      console.log(agentId, rev_agent, agent);
      const f = await User.findByIdAndUpdate(
        agentId,
        {
          $pull: { connection: customerId },
        },
        { new: true }
      );
      console.log(f, "fdfsf");
      //assign new agent to customer
      console.log(customerId);
      const agents = await User.find({ type: "AGENT" });
      let min_connections = { count: -1, id: "" };
      agents.forEach((item) => {
        if (agent.size > 0 && agent.has(item.id)) {
          if (min_connections.count == -1)
            min_connections = { count: item.connection.length, id: item.id };
          else if (item.connection.length < min_connections.count)
            min_connections = { count: item.connection.length, id: item.id };
        }
        if (agent.size === 0) {
          if (min_connections.count == -1)
            min_connections = { count: item.connection.length, id: item.id };
          else if (item.connection.length < min_connections.count)
            min_connections = { count: item.connection.length, id: item.id };
        }
      });

      //assign customr to new agent
      await User.findByIdAndUpdate(customerId, {
        $set: { connection: [min_connections.id] },
      });
      console.log(min_connections);
      //assign new customer to new agent
      const Agent = await User.findByIdAndUpdate(min_connections.id, {
        $addToSet: { connection: customerId },
      });
      const u = await User.findById(customerId);
      console.log("fdfd", u);
      socket.emit("on-close", customerId);
      io.to(agent.get(min_connections.id)).emit("add-chat", u);
    } catch (err) {
      console.log(err);
    }
  });
});
