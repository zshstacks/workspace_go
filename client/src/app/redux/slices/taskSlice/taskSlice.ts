import { TaskErrorPayload, TaskState } from "@/app/utility/types/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  completeTask,
  createTask,
  deleteTask,
  getAllTasks,
  updateTaskDescription,
} from "./asyncActions";

const initialState: TaskState = {
  tasks: [],
  isLoading: false,
  error: null,
};

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      //fetch tasks
      .addCase(getAllTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload.data;
      })
      //create task
      .addCase(createTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks.push(action.payload.data);
      })
      //update task description
      .addCase(updateTaskDescription.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedTask = action.payload.data;

        const index = state.tasks.findIndex(
          (task) => task.LocalID === updatedTask.LocalID
        );
        if (index !== -1) {
          state.tasks[index] = updatedTask;
        }
      })

      .addCase(completeTask.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedTask = action.payload.data;
        const index = state.tasks.findIndex(
          (task) => task.LocalID === updatedTask.LocalID
        );

        if (index !== -1) {
          state.tasks[index] = updatedTask;
        }
      })

      //delete task
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = state.tasks.filter(
          (task) => task.LocalID !== action.meta.arg //take from array
        );
      })

      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.isLoading = true;
        }
      )

      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action: PayloadAction<TaskErrorPayload>) => {
          state.isLoading = false;

          state.error = action.payload?.error || null;
        }
      );
  },
});

export default taskSlice.reducer;
