const Chat = require("../models/chat.model");
const User = require("../models/user.model");
const getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const messages = await Chat.find({ $or: [{ to: id }, { from: id }] })
      .populate("from")
      .populate("to")
      .sort({ createdAt: 1 });
    //console.log(messages);
    return res.status(200).json({
      data: messages,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err });
  }
};
const getChats = async (req, res) => {
  try {
    const id = req.params.id;
    //console.log("getchat");
    const user = await User.findById(id).populate({ path: "connection" });
    //console.log(user.connection);
    return res.status(200).json({ data: user.connection });
  } catch (err) {
    return res.status(400).json({ error: err });
  }
};
module.exports = { getMessages, getChats };
