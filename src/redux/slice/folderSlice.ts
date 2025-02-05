import { IFolderProps } from "@/types";
import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "./store";

const initialState: IFolderProps = {
  folders: [],
  selectedFolder: null,
  postsByFolder: {},
  searchQuery: "",
};
const folderSlice = createSlice({
  name: "folders",
  initialState,
  reducers: {
    SET_FOLDERS: (state, action) => {
      state.folders = action.payload;
    },
    SET_SELECTED_FOLDER: (state, action) => {
      state.selectedFolder = action.payload;
    },
    SET_POSTS_BY_FOLDER: (state, action) => {
      const { folderId, posts } = action.payload;

      if (!state.postsByFolder) {
        state.postsByFolder = {};
      }

      state.postsByFolder[folderId] = posts;
    },
    SET_SEARCH_QUERY: (state, action) => {
      state.searchQuery = action.payload;
    },
    ADD_FOLDERS: (state, action) => {
      state.folders.push(action.payload);
    },
    UPDATE_FOLDERS: (state, action) => {
      const index = state.folders.findIndex(
        (folder) => folder.id === action.payload.id
      );
      if (index !== -1) {
        state.folders[index] = action.payload;
      }
    },
    DELETE_FOLDERS: (state, action) => {
      state.folders = state.folders.filter((folder) => {
        return folder.id !== action.payload;
      });
    },
  },
});

export const {
  SET_FOLDERS,
  SET_SELECTED_FOLDER,
  SET_POSTS_BY_FOLDER,
  SET_SEARCH_QUERY,
  ADD_FOLDERS,
  UPDATE_FOLDERS,
  DELETE_FOLDERS,
} = folderSlice.actions;
export const selectFolderList = (state: RootState) => state.folder.folders;
export const selectSelectedFolder = (state: RootState) =>
  state.folder.selectedFolder;
export const selectPostsByFolder = (state: RootState) =>
  state.folder.postsByFolder;
export const selectSearchQuery = (state: RootState) => state.folder.searchQuery;
export default folderSlice.reducer;
