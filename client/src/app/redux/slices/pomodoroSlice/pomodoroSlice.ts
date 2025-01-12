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
  currentPhase: "pomodoro",
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
      state.currentPhase = action.payload;
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
        state.isRunning = action.payload.isRunning;
      })

      .addCase(startPomodoro.fulfilled, (state) => {
        if (!state.remainingTime || state.remainingTime <= 0) {
          switch (state.currentPhase) {
            case "pomodoro":
              state.remainingTime = state.settings.pomodoro * 60;
              break;
            case "shortBreak":
              state.remainingTime = state.settings.shortBreak * 60;
              break;
            case "longBreak":
              state.remainingTime = state.settings.longBreak * 60;
              break;
          }
        }
        state.isRunning = true;
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
