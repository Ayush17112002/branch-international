import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: { userName: "", id: "", type: "", loggedIn: false },
  reducers: {
    login(state, action) {
      const { userName, id, type } = action.payload;
      (state.id = id),
        (state.userName = userName),
        (state.loggedIn = true),
        (state.type = type);
    },
    logout(state, action) {
      state.loggedIn = false;
    },
  },
});

export const { login, logout } = userSlice.actions;
export const userSliceReducer = userSlice.reducer;
