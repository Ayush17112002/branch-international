import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
  name: "message",
  initialState: { messages: [] },
  reducers: {
    setMessages(state, action) {
      const messages = action.payload;
      console.log(messages);
      state.messages = [];
      messages.forEach((msg) => {
        state.messages.push(msg);
      });
    },
    addMessage(state, action) {
      state.messages.push(action.payload);
    },
  },
});

export const { setMessages, addMessage } = messageSlice.actions;
export const messageSliceReducer = messageSlice.reducer;
