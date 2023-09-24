const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    message: {
      text: { type: String, required: true },
    },
    from: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User",
    },
    to: {
      type: mongoose.Types.ObjectId,

      default: null,
      ref: "User",
    },
  },
  { timestamps: true }
);
const chatModel = mongoose.model("Chat", chatSchema);
module.exports = chatModel;
