import { AuthState, ErrorPayload } from "@/app/utility/types/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { loginUser, registerUser } from "./asyncActions";

const initialState: AuthState = {
  emailError: null,
  passwordError: null,
  usernameError: null,
  error: null,
  success: null,
  errorLogin: null,
  successLogin: null,
  isLoading: false,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearSuccess: (state) => {
      state.success = null;
    },
    clearErrors: (state) => {
      state.error = null;
      state.passwordError = null;
      state.emailError = null;
      state.usernameError = null;
    },
    clearLoginErrors: (state) => {
      state.errorLogin = null;
    },
    clearSuccessLogin: (state) => {
      state.successLogin = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = action.payload.success;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.successLogin = action.payload.successLogin;
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
          state.errorLogin = null;
          state.successLogin = null;
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
          if (action.payload?.errorLogin) {
            state.errorLogin = action.payload.errorLogin;
          }

          if (action.payload?.error) {
            state.error = action.payload.error;
          }
        }
      );
  },
});

export const {
  clearSuccess,
  clearErrors,
  clearLoginErrors,
  clearSuccessLogin,
} = authSlice.actions;

export default authSlice.reducer;
