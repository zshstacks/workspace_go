import { UserErrorPayload, UserState } from "@/app/utility/types/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { validateUser } from "./asyncActions";

const initialState: UserState = {
  user: null,
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(validateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })

      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.isLoading = true;
        }
      )

      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action: PayloadAction<UserErrorPayload>) => {
          state.isLoading = false;

          state.error = action.payload?.error || null;
        }
      );
  },
});

export default userSlice.reducer;
