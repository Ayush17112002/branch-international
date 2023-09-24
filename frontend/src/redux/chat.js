import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: { chats: [] },
  reducers: {
    setChats(state, action) {
      const chats = action.payload;
      state.chats = [];
      console.log(chats, "redux");
      chats.forEach((msg) => {
        state.chats.push(msg);
      });
    },
    addChat(state, action) {
      let b = false;
      state.chats.forEach((c) => {
        if (String(c._id) === String(action.payload._id)) b = true;
      });
      if (!b) state.chats.push(action.payload);
    },
    removeCustomer(state, action) {
      const temp = [];
      state.chats.forEach((chat) => {
        console.log(chat._id, action.payload);
        if (chat._id !== action.payload) temp.push(chat);
      });
      state.chats = JSON.parse(JSON.stringify(temp));
    },
  },
});

export const { setChats, addChat, removeCustomer } = chatSlice.actions;
export const chatSliceReducer = chatSlice.reducer;
