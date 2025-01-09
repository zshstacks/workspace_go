import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice/authSlice";
import userReducer from "./slices/userSlice/userSlice";
import pomodoroReducer from "./slices/pomodoroSlice/pomodoroSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    pomodoro: pomodoroReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
