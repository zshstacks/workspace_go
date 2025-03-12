import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice/authSlice";
import userReducer from "./slices/userSlice/userSlice";
import pomodoroReducer from "./slices/pomodoroSlice/pomodoroSlice";
import taskReducer from "./slices/taskSlice/taskSlice";
import statsReducer from "./slices/statsSlice/statsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    pomodoro: pomodoroReducer,
    tasks: taskReducer,
    stats: statsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
