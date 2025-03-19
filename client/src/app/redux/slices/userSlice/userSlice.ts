import { UserErrorPayload, UserState } from "@/app/utility/types/reduxTypes";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeUsername, deleteUser, validateUser } from "./asyncActions";

const initialState: UserState = {
  user: null,
  isLoading: false,
  error: null,
  successDelete: null,
  username: "",
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

      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.successDelete = action.payload.successDelete;
      })

      .addCase(changeUsername.fulfilled, (state, action) => {
        state.isLoading = false;
        state.username = action.payload.username;
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
