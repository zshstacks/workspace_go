import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api";
import { AxiosError } from "axios";

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
    } catch (error) {
      const axiosError = error as AxiosError;
      return thunkAPI.rejectWithValue(
        axiosError.response?.data || "Failed to update pomo settings"
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
    } catch (error) {
      const axiosError = error as AxiosError;
      return thunkAPI.rejectWithValue(
        axiosError.response?.data || "failed to fetch pomodoro settings"
      );
    }
  }
);

export const fetchTimerStatus = createAsyncThunk(
  "pomodoro/fetchTimerStatus",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/pomodoro-timer-status");
      return res.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      return thunkAPI.rejectWithValue(
        axiosError.response?.data || "Failed to fetch timer status"
      );
    }
  }
);

export const startPomodoro = createAsyncThunk(
  "pomodoro/startPomodoro",
  async (phase: "pomodoro" | "shortBreak" | "longBreak", thunkAPI) => {
    try {
      const res = await api.post("/pomodoro-start", { phase });
      return res.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      return thunkAPI.rejectWithValue(
        axiosError.response?.data || "failed to start pomodoro"
      );
    }
  }
);

export const stopPomodoro = createAsyncThunk(
  "pomodoro/stopPomodoro",
  async (_, thunkAPI) => {
    try {
      const res = await api.post("/pomodoro-stop");
      return res.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      return thunkAPI.rejectWithValue(
        axiosError.response?.data || "Failed to stop pomodoro"
      );
    }
  }
);

export const changePhase = createAsyncThunk(
  "pomodoro/changePhase",
  async (phase: "pomodoro" | "shortBreak" | "longBreak", thunkAPI) => {
    try {
      const res = await api.post("/pomodoro-phase", { phase });
      return res.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      return thunkAPI.rejectWithValue(
        axiosError.response?.data || "Failed to change phase"
      );
    }
  }
);

export const updateAutoTransition = createAsyncThunk(
  "pomodoro/updateAutoTransition",
  async (autoTransition: boolean, thunkAPI) => {
    try {
      const res = await api.post("/pomodoro-auto-mode", { autoTransition });
      return res.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      return thunkAPI.rejectWithValue(
        axiosError.response?.data || "Failed to update auto-transition"
      );
    }
  }
);

export const resetCompletedPomodoros = createAsyncThunk(
  "pomodoro/resetCompletedPomodoros",
  async (_, thunkAPI) => {
    try {
      const res = await api.post("/pomodoro-reset");
      return res.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      return thunkAPI.rejectWithValue(
        axiosError.response?.data || "Failed to reset completed pomodoros"
      );
    }
  }
);
