import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getAllStats, updateDailyStreak } from "./asyncActions";
import { StatsErrorPayload, StatsState } from "@/app/utility/types/reduxTypes";

const initialState: StatsState = {
  currentStreak: 0,
  highestStreak: 0,
  lastVisitDate: 0,
  isLoading: false,
  error: null,
};

const statsSlice = createSlice({
  name: "stats",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      //get all stats
      .addCase(getAllStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentStreak = action.payload.currentStreak;
        state.highestStreak = action.payload.highestStreak;
        state.lastVisitDate = action.payload.lastVisitDate;
      })

      .addCase(updateDailyStreak.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentStreak = action.payload.currentStreak;
        state.highestStreak = action.payload.highestStreak;
        state.lastVisitDate = action.payload.lastVisitDate;
      })

      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.isLoading = true;
        }
      )

      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action: PayloadAction<StatsErrorPayload>) => {
          state.isLoading = false;
          state.error = action.payload?.error || null;
        }
      );
  },
});

export default statsSlice.reducer;
