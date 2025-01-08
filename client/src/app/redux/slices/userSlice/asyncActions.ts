import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api";

export const validateUser = createAsyncThunk(
  "user/validateUser",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/validate");
      return res.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to validate user"
      );
    }
  }
);
