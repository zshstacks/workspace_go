import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api";

export const getAllTasks = createAsyncThunk(
  "tasks/getAllTasks",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/tasks");
      return res.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "cannot fetch all tasks"
      );
    }
  }
);

export const createTask = createAsyncThunk(
  "tasks/createTask",
  async (
    { title, description }: { title: string; description: string },
    thunkAPI
  ) => {
    try {
      const res = await api.post("/tasks-create", { title, description });
      return res.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Can`t create a task"
      );
    }
  }
);

export const updateTaskDescription = createAsyncThunk(
  "tasks/updateTaskDescription",
  async (
    { id, description }: { id: number; description: string },
    thunkAPI
  ) => {
    try {
      const res = await api.put(`/task/update-description/${id}`, {
        description,
      });
      return res.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Cannot update a task description"
      );
    }
  }
);

export const deleteTask = createAsyncThunk(
  "tasks/deleteTask",
  async (id: number, thunkAPI) => {
    try {
      const res = await api.delete(`/task/delete/${id}`);
      return res.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Cannot delete a task"
      );
    }
  }
);
