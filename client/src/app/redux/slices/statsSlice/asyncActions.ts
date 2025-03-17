import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api";
import { AxiosError } from "axios";

export const getAllStats = createAsyncThunk(
  "stats/getAllStats",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/stats");
      return res.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      return thunkAPI.rejectWithValue(
        axiosError.response?.data || "cant fetch stats"
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
    } catch (error) {
      const axiosError = error as AxiosError;
      return thunkAPI.rejectWithValue(
        axiosError.response?.data || "Cant update daily streak"
      );
    }
  }
);
