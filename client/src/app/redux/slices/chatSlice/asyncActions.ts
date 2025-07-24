import {
  ChatState,
  ConnectToChatParams,
  Message,
} from "@/app/utility/types/reduxTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const connectToChat = createAsyncThunk(
  "chat/connectToChat",
  async ({ currentUserID, targetUserID }: ConnectToChatParams, thunkAPI) => {
    try {
      const wsUrl = `ws://localhost:8000/chat?userID=${currentUserID}&chatWithID=${targetUserID}`;

      return new Promise<{ ws: WebSocket; roomID: string }>(
        (resolve, reject) => {
          const ws = new WebSocket(wsUrl);

          ws.onopen = () => {
            console.log(
              `Connected to chat room: ${currentUserID} <-> ${targetUserID}`
            );
            const roomID = [currentUserID, targetUserID].sort().join(":");
            resolve({ ws, roomID });
          };

          ws.onerror = (error) => {
            console.error("WebSocket connection error:", error);
            reject(new Error("Failed to connect to chat"));
          };

          ws.onclose = () => {
            console.log("WebSocket connection closed");
          };
        }
      );
    } catch (error) {
      return thunkAPI.rejectWithValue({
        error:
          error instanceof Error ? error.message : "Failed to connect to chat",
      });
    }
  }
);

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (message: Omit<Message, "timestamp">, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as { chat: ChatState };
      const { ws } = state.chat;

      if (!ws || ws.readyState !== WebSocket.OPEN) {
        throw new Error("WebSocket connection is not open");
      }

      const messageWithTimestamp: Message = {
        ...message,
        timestamp: new Date().toISOString(),
      };

      ws.send(JSON.stringify(messageWithTimestamp));
      return messageWithTimestamp;
    } catch (error) {
      return thunkAPI.rejectWithValue({
        error:
          error instanceof Error ? error.message : "Failed to send message",
      });
    }
  }
);

export const disconnectFromChat = createAsyncThunk(
  "chat/disconnectFromChat",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as { chat: ChatState };
      const { ws } = state.chat;

      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }

      return true;
    } catch (error) {
      return thunkAPI.rejectWithValue({
        error: "Failed to disconnect from chat",
      });
    }
  }
);
