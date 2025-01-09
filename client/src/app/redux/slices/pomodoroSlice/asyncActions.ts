import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api";

export const updatePomodoroTime = createAsyncThunk(
  "pomodoro/updatePomodoroTime",
  async (
    {
      pomodoro,
      shortBreak,
      longBreak,
    }: { pomodoro: number; shortBreak: number; longBreak: number },
    thunkAPI
  ) => {
    try {
      const res = await api.post("/pomodoro-update-settings", {
        pomodoro,
        shortBreak,
        longBreak,
      });

      return res.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to update pomo settings"
      );
    }
  }
);

export const getPomodoroSettings = createAsyncThunk(
  "pomodoro/getPomodoroSettings",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/pomodoro-settings");
      return res.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "failed to fetch pomodoro settings"
      );
    }
  }
);
