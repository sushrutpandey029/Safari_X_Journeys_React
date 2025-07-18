import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: null,
  isLoggedIn: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isLoggedIn = true;
    },
    logout: (state, action) => {
      state.user = null;
      state.token = null;
      state.isLoggedIn = false;
    },
    updateProfile: (state, action) => {
      state.user = action.payload.user;
    },
  },
});

export const { loginSuccess, logout, updateProfile } = authSlice.actions;
export default authSlice.reducer;
