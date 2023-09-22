import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: { userName: "", id: "", loggedIn: false },
  reducers: {
    login(state, action) {
      const { userName, id } = action.payload;
      (state.id = id), (state.userName = userName), (state.loggedIn = true);
    },
    logout(state, action) {
      state.loggedIn = false;
    },
  },
});

export const { login, logout } = userSlice.actions;
export const userSliceReducer = userSlice.reducer;
