import { AuthState, ErrorPayload } from "@/app/utility/types/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { registerUser } from "./asyncActions";

const initialState: AuthState = {
  emailError: null,
  passwordError: null,
  usernameError: null,
  error: null,
  success: null,
  isLoading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearSuccess: (state) => {
      state.success = null;
    },
  },
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
          state.passwordError = null;
          state.emailError = null;
          state.usernameError = null;
          state.success = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action: PayloadAction<ErrorPayload>) => {
          state.isLoading = false;

          if (action.payload?.emailError) {
            state.emailError = action.payload.emailError;
          }
          if (action.payload?.usernameError) {
            state.usernameError = action.payload.usernameError;
          }
          if (action.payload?.passwordError) {
            state.passwordError = action.payload.passwordError;
          }
          if (
            !action.payload?.emailError &&
            !action.payload?.usernameError &&
            !action.payload?.passwordError
          ) {
            state.error = "Something went wrong!";
          }
        }
      );
  },
});

export const { clearSuccess } = authSlice.actions;

export default authSlice.reducer;
