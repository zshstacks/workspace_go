import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  changePhase,
  fetchTimerStatus,
  getPomodoroSettings,
  startPomodoro,
  stopPomodoro,
  updateAutoTransition,
  updatePomodoroTime,
} from "./asyncActions";
import { PomodoroErrorPayload, PomodoroState } from "@/app/utility/types/types";

const initialState: PomodoroState = {
  settings: {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
    autoTransitionEnabled: false,
  },
  remainingTime: 25 * 60,
  currentPhase: "pomodoro",
  isLoading: false,
  isRunning: false,
  completedPomodoros: 0,
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
        state.currentPhase = action.payload.currentPhase;
        state.completedPomodoros = action.payload.completedPomodoros;
        state.settings.autoTransitionEnabled = action.payload.autoTransition;
      })

      .addCase(startPomodoro.fulfilled, (state) => {
        state.isRunning = true;
      })

      .addCase(stopPomodoro.fulfilled, (state) => {
        state.isRunning = false;
        state.isLoading = false;
      })

      .addCase(changePhase.fulfilled, (state, action) => {
        state.currentPhase = action.payload;
      })

      .addCase(updateAutoTransition.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings.autoTransitionEnabled = action.payload.autoTransition;
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
