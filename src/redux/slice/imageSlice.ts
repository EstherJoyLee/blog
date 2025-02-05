import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "./store";

// Slice의 상태 타입 정의
interface IImageState {
  publicUrl: string | null;
}

const initialState: IImageState = {
  publicUrl: null,
};

// Slice 생성
const imageSlice = createSlice({
  name: "image",
  initialState,
  reducers: {
    setPublicUrl(state, action) {
      state.publicUrl = action.payload;
    },
    clearPublicUrl(state) {
      state.publicUrl = null;
    },
  },
});

// 액션과 리듀서 내보내기
export const { setPublicUrl, clearPublicUrl } = imageSlice.actions;
export const selectPublicUrl = (state: RootState) => state.image.publicUrl;
export default imageSlice.reducer;
