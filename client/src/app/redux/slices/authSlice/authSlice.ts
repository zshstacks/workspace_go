import { AuthState } from "@/app/utility/types/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { registerUser } from "./asyncActions";

const initialState: AuthState = {
  error: null,
  user: null,
  isLoading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action: PayloadAction<string>) => {
          state.isLoading = false;
          state.error = action.payload as string;
        }
      );
  },
});

export default authSlice.reducer;
