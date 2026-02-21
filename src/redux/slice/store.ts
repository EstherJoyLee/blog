import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import folderReducer from "./folderSlice";

const rootReducer = combineReducers({
  auth: authReducer,
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
