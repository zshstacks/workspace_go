import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchTimerStatus,
  getPomodoroSettings,
  startPomodoro,
  stopPomodoro,
  updatePomodoroTime,
} from "./asyncActions";
import { PomodoroErrorPayload, PomodoroState } from "@/app/utility/types/types";

const initialState: PomodoroState = {
  settings: {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
  },
  remainingTime: 25 * 60,
  currentMode: "pomodoro",
  isLoading: false,
  isRunning: false,
  error: null,
};

const pomodoroSlice = createSlice({
  name: "pomodoro",
  initialState,
  reducers: {
    changeMode: (
      state,
      action: PayloadAction<"pomodoro" | "shortBreak" | "longBreak">
    ) => {
      state.currentMode = action.payload;
    },

    updateRemainingTime: (state, action: PayloadAction<number>) => {
      state.remainingTime = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(updatePomodoroTime.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
      })

      .addCase(getPomodoroSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
      })

      .addCase(fetchTimerStatus.fulfilled, (state, action) => {
        state.remainingTime = action.payload.remainingTime;
        state.currentMode = action.payload.currentMode;
        state.isRunning = action.payload.isRunning;
      })

      .addCase(startPomodoro.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isRunning = true;
        state.currentMode = action.payload.currentPhase;
      })

      .addCase(stopPomodoro.fulfilled, (state) => {
        state.isRunning = false;
        state.isLoading = false;
      })

      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.isLoading = true;
        }
      )

      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action: PayloadAction<PomodoroErrorPayload>) => {
          state.isLoading = false;

          state.error = action.payload?.error || null;
        }
      );
  },
});

export const { changeMode, updateRemainingTime } = pomodoroSlice.actions;

export default pomodoroSlice.reducer;
