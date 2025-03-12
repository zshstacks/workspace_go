import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api";

export const getAllStats = createAsyncThunk(
  "stats/getAllStats",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/stats");
      return res.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "cant fetch stats"
      );
    }
  }
);

export const updateDailyStreak = createAsyncThunk(
  "stats/updateDailyStreak",
  async (_, thunkAPI) => {
    try {
      const res = await api.post("/stats/update-streak");
      return res.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Cant update daily streak"
      );
    }
  }
);
