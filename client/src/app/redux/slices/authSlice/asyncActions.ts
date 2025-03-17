import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api";
import { AxiosError } from "axios";

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (
    userData: {
      email: string;
      password: string;
      username: string;
    },
    thunkAPI
  ) => {
    try {
      const res = await api.post("/signup", userData);
      return res.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      return thunkAPI.rejectWithValue(
        axiosError.response?.data || "Register failed"
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (
    { email, password }: { email: string; password: string },
    thunkAPI
  ) => {
    try {
      const res = await api.post("/login", { email, password });
      return res.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      return thunkAPI.rejectWithValue(
        axiosError.response?.data || "Login failed"
      );
    }
  }
);

export const emailConfirmation = createAsyncThunk(
  "auth/emailConfirmation",
  async (data: { code: string }, thunkAPI) => {
    try {
      const res = await api.post("/confirm-email", { code: data.code });
      return res.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      return thunkAPI.rejectWithValue(
        axiosError.response?.data || "Confirmation failed"
      );
    }
  }
);

export const resendConfirmation = createAsyncThunk(
  "auth/resendConfirmation",
  async ({ email }: { email: string }, thunkAPI) => {
    try {
      const res = await api.post("/resend-confirmation-code", { email });
      return res.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      return thunkAPI.rejectWithValue(
        axiosError.response?.data || "Failed to resend confirmation code"
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/logout");
      return res.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      return thunkAPI.rejectWithValue(
        axiosError.response?.data || "Logout failed"
      );
    }
  }
);
