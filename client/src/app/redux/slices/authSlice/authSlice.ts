import { AuthState, ErrorPayload } from "@/app/utility/types/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { registerUser } from "./asyncActions";

const initialState: AuthState = {
  error: null,
  success: null,
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
        state.success = action.payload.success;
      })
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.isLoading = true;
          state.error = null;
          state.success = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action: PayloadAction<string | ErrorPayload>) => {
          state.isLoading = false;

          if (typeof action.payload === "string") {
            state.error = action.payload;
          } else if (action.payload?.error) {
            state.error = action.payload.error;
          } else {
            state.error = "Something went wrong!";
          }
        }
      );
  },
});

export default authSlice.reducer;
