const express = require("express");
const cors = require("cors");
const app = express();
const server = require("http").createServer(app);
const socket = require("socket.io");
app.use(cors());
app.use(express.json());
require("dotenv").config();

server.listen(process.env.SERVER_PORT, (err) => {
  if (err) {
    console.log("Error in running the server");
  } else {
    console.log(`Server is running at port ${process.env.SERVER_PORT}`);
  }
});

const io = socket(server, { cors: "*" });

io.on("connection", (socket) => {
  console.log(socket.id);
  socket.emit("user-connected", socket.id);
  socket.on("disconnect", () => {
    console.log("disconnected", socket.id);
  });
});
