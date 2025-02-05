import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import imageReducer from "./imageSlice";
import folderReducer from "./folderSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  image: imageReducer,
  folder: folderReducer,
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
