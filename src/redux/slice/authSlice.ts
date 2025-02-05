import { RootState } from "./store";
import { createSlice } from "@reduxjs/toolkit";
interface IAuthState {
  isLoggedIn: boolean;
  email: null | string;
  userName: null | string;
  userID: null | string;
  userPhotoURL: null | string;
}

const initialState: IAuthState = {
  isLoggedIn: false,
  email: null,
  userName: null,
  userID: null,
  userPhotoURL: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    LOGIN: (state, action) => {
      state.isLoggedIn = true;
      state.email = action.payload.email;
      state.userName = action.payload.userName;
      state.userID = action.payload.userID;
      state.userPhotoURL = action.payload.userPhoto;
    },
    LOGOUT: (state) => {
      state.isLoggedIn = false;
      state.email = null;
      state.userName = null;
      state.userID = null;
      state.userPhotoURL = null;
    },
  },
});

export const { LOGIN, LOGOUT } = authSlice.actions;

export const selectIsLoggedIn = (state: RootState) => state.auth.isLoggedIn;
export const selectEmail = (state: RootState) => state.auth.email;
export const selectUserName = (state: RootState) => state.auth.userName;
export const selectUserID = (state: RootState) => state.auth.userID;
export const selectUserPhotoURL = (state: RootState) => state.auth.userPhotoURL;

export default authSlice.reducer;
