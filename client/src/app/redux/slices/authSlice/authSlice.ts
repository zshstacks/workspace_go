import { AuthState, ErrorPayload } from "@/app/utility/types/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  emailConfirmation,
  loginUser,
  logoutUser,
  registerUser,
  resendConfirmation,
} from "./asyncActions";

const initialState: AuthState = {
  emailError: null,
  passwordError: null,
  usernameError: null,
  error: null,
  errorLogin: null,
  errorCodeEmail: null,

  success: null,
  successLogin: null,
  successCodeEmail: null,
  successResent: null,
  successLogout: null,

  isLoading: false,
  user: null,
};

const resetStates = (state: AuthState) => {
  state.emailError = null;
  state.passwordError = null;
  state.usernameError = null;
  state.error = null;
  state.errorLogin = null;
  state.success = null;
  state.successLogin = null;
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
    clearEmailConf: (state) => {
      state.successCodeEmail = null;
      state.errorCodeEmail = null;
    },
    clearResentConf: (state) => {
      state.successResent = null;
    },
    clearLogout: (state) => {
      state.successLogout = null;
    },
  },
  extraReducers: (builder) => {
    builder
      //register
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = action.payload.success;
      })
      //login
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.successLogin = action.payload.successLogin;
      })
      //email confirm
      .addCase(emailConfirmation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successCodeEmail = action.payload.successCodeEmail;
      })
      //resend code
      .addCase(resendConfirmation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successResent = action.payload.successResent;
      })
      //logout
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successLogout = action.payload.successLogout;
      })

      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.isLoading = true;
          resetStates(state);
        }
      )

      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action: PayloadAction<ErrorPayload>) => {
          state.isLoading = false;

          state.emailError = action.payload?.emailError || null;
          state.errorCodeEmail = action.payload?.errorCodeEmail || null;
          state.usernameError = action.payload?.usernameError || null;
          state.passwordError = action.payload?.passwordError || null;
          state.errorLogin = action.payload?.errorLogin || null;

          state.error = action.payload?.error || null;
        }
      );
  },
});

export const {
  clearSuccess,
  clearErrors,
  clearLoginErrors,
  clearSuccessLogin,
  clearEmailConf,
  clearResentConf,
  clearLogout,
} = authSlice.actions;

export default authSlice.reducer;
