import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice/authSlice";
import userReducer from "./slices/userSlice/userSlice";
import pomodoroReducer from "./slices/pomodoroSlice/pomodoroSlice";
import taskReducer from "./slices/taskSlice/taskSlice";
import statsReducer from "./slices/statsSlice/statsSlice";
import chatReducer from "./slices/chatSlice/chatSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    pomodoro: pomodoroReducer,
    tasks: taskReducer,
    stats: statsReducer,
    chat: chatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore WebSocket instances in Redux state
        ignoredActions: ["chat/connectToChat/fulfilled"],
        ignoredPaths: ["chat.ws"],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
