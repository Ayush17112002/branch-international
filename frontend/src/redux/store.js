import { configureStore } from "@reduxjs/toolkit";

import { userSliceReducer } from "./user";
import { messageSliceReducer } from "./message";
import { chatSliceReducer } from "./chat";
const store = configureStore({
  reducer: {
    user: userSliceReducer,
    message: messageSliceReducer,
    chat: chatSliceReducer,
  },
});
export default store;
