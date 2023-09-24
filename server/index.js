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
        if (myUser.connection.length > 0 && agent.has(myUser.connection[0])) {
          //do nothing
        } else {
          let min_connections = { count: -1, id: null };
          console.log(min_connections);
          agents.forEach((item) => {
            if (agent.size > 0 && agent.has(item.id)) {
              if (min_connections.count == -1) {
                min_connections = {
                  count: item.connection.length,
                  id: item.id,
                };
              } else {
                if (item.connection.length < min_connections.count)
                  min_connections = {
                    count: item.connection.length,
                    id: item.id,
                  };
              }
            }
          });
          if (myUser.connection.length > 0) {
            //if (myUser.connection[0] === min_connections.id) b = true;
            //close previous connection
            await User.findByIdAndUpdate(myUser.connection[0], {
              $pull: { connection: myUser.id },
            });
          }
          // await User.findByIdAndUpdate(myUser.id, { $set: { connection: [] } });
          console.log(
            "fdfd",
            myUser,
            min_connections,
            typeof min_connections.id
          );
          if (min_connections.id) {
            const Agent = await User.findByIdAndUpdate(min_connections.id, {
              $addToSet: { connection: userId },
            });
            const u = await User.findByIdAndUpdate(userId, {
              $set: { connection: [min_connections.id] },
            });
            console.log(u);
            if (agent.has(min_connections.id))
              io.to(agent.get(min_connections.id)).emit("add-chat", u);
          }
        }
      } else if (myUser && myUser.type === "AGENT") {
        //only add into map
        agent.set(userId, socket.id);
        rev_agent.set(socket.id, userId);

        const customers = await User.find({ type: "CUSTOMER" });
        const myAgent = await User.findById(userId);
        console.log(customers, myAgent);
        await Promise.all(
          customers.map(async (c) => {
            try {
              console.log(c);
              if (c.connection.length === 0) {
                await User.findByIdAndUpdate(c.id, {
                  $push: { connection: myAgent.id },
                });
                await User.findByIdAndUpdate(myAgent.id, {
                  $push: { connection: c.id },
                });
                console.log(socket.id);
                io.to(socket.id).emit("add-chat", c);
              }
            } catch (err) {
              console.log(err);
            }
          })
        );
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
        fun.to = user.connection.length > 0 ? String(user.connection[0]) : null;
        const newChat = new Chat(fun);
        await newChat.save();
        const res = await Chat.findById(newChat._id)
          .populate("from")
          .populate("to");
        callback(res);
        console.log(res, fun);
        if (fun.to) {
          await User.findByIdAndUpdate(fun.to, {
            $addToSet: { connection: fun.from },
          });
        }
        if (agent.has(fun.to)) {
          console.log("hai");
          io.to(agent.get(fun.to)).emit("receive-message", res);
        }
      }
    } catch (err) {
      console.log(err);
    }
  });
  socket.on("close", async (customerId) => {
    try {
      const agentId = rev_agent.get(socket.id);
      const f = await User.findByIdAndUpdate(
        agentId,
        {
          $pull: { connection: customerId },
        },
        { new: true }
      );
      await User.findByIdAndUpdate(customerId, {
        $set: { connection: [] },
      });
      socket.emit("on-close", customerId);
      if (customer.has(customerId)) {
        //assign new agent to customer
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
        //assign new agent to customer
        await User.findByIdAndUpdate(customerId, {
          $set: { connection: [min_connections.id] },
        });
        //assign customer to the new agent
        const Agent = await User.findByIdAndUpdate(min_connections.id, {
          $addToSet: { connection: customerId },
        });
        const u = await User.findById(customerId);
        io.to(agent.get(min_connections.id)).emit("add-chat", u);
      }
    } catch (err) {
      console.log(err);
    }
  });
});
