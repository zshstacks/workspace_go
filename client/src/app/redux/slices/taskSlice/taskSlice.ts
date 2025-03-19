import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  completeTask,
  createTask,
  deleteAllCompletedTasks,
  deleteAllTasks,
  deleteTask,
  getAllTasks,
  updateTaskDescription,
  UpdateTaskOrder,
  updateTaskTitle,
} from "./asyncActions";
import { TaskErrorPayload, TaskState } from "@/app/utility/types/reduxTypes";

const initialState: TaskState = {
  tasks: [],
  isLoading: false,

  error: null,
  updateTitleError: null,
  updateDescriptionError: null,
  createTitleError: null,
  createDescriptionError: null,
};

const resetStates = (state: TaskState) => {
  state.error = null;
  state.updateTitleError = null;
  state.updateDescriptionError = null;
  state.createTitleError = null;
  state.createDescriptionError = null;
};

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    reorderTasks: (state, action) => {
      state.tasks = action.payload;
    },
    clearCreateErrors: (state) => {
      resetStates(state);
    },
    clearUpdateErrors: (state) => {
      resetStates(state);
    },
  },
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

      //update task title
      .addCase(updateTaskTitle.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedTask = action.payload.data;

        const index = state.tasks.findIndex(
          (task) => task.LocalID === updatedTask.LocalID
        );

        if (index !== -1) {
          state.tasks[index] = updatedTask;
        }
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

      //complete task
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

      //delete all tasks
      .addCase(deleteAllTasks.fulfilled, (state) => {
        state.isLoading = false;
        state.tasks = [];
      })

      //delete all completed tasks
      .addCase(deleteAllCompletedTasks.fulfilled, (state) => {
        state.isLoading = false;
        state.tasks = state.tasks.filter((task) => !task.Completed);
      })

      //update task order
      .addCase(UpdateTaskOrder.fulfilled, (state) => {
        state.isLoading = false;
      })

      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.isLoading = true;
          resetStates(state);
        }
      )

      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action: PayloadAction<TaskErrorPayload>) => {
          state.isLoading = false;

          state.createTitleError = action.payload?.createTitleError || null;
          state.createDescriptionError =
            action.payload?.createDescriptionError || null;
          state.updateTitleError = action.payload?.updateTitleError || null;
          state.updateDescriptionError =
            action.payload?.updateDescriptionError || null;

          state.error = action.payload?.error || null;
        }
      );
  },
});

export const { reorderTasks, clearCreateErrors, clearUpdateErrors } =
  taskSlice.actions;
export default taskSlice.reducer;
