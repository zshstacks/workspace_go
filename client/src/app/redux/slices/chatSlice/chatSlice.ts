import {
  ChatErrorPayload,
  ChatState,
  Message,
} from "@/app/utility/types/reduxTypes";
import { connectToChat, disconnectFromChat, sendMessage } from "./asyncActions";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: ChatState = {
  activeRoom: null,
  ws: null,
  isConnecting: false,
  isConnected: false,
  error: null,
  targetUserID: "",
  currentUserID: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setTargetUserID: (state, action: PayloadAction<string>) => {
      state.targetUserID = action.payload;
    },

    setCurrentUserID: (state, action: PayloadAction<string>) => {
      state.currentUserID = action.payload;
    },

    receiveMessage: (state, action: PayloadAction<Message>) => {
      if (state.activeRoom) {
        state.activeRoom.messages.push(action.payload);
      }
    },

    clearError: (state) => {
      state.error = null;
    },

    resetChat: (state) => {
      state.activeRoom = null;
      state.ws = null;
      state.isConnected = false;
      state.isConnecting = false;
      state.error = null;
      state.targetUserID = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // Connect to chat
      .addCase(connectToChat.pending, (state) => {
        state.isConnecting = true;
        state.error = null;
      })
      .addCase(connectToChat.fulfilled, (state, action) => {
        state.isConnecting = false;
        state.isConnected = true;
        state.ws = action.payload.ws;

        if (state.currentUserID && state.targetUserID) {
          state.activeRoom = {
            id: action.payload.roomID,
            participantA: state.currentUserID,
            participantB: state.targetUserID,
            messages: [],
            isConnected: true,
          };
        }
      })
      .addCase(connectToChat.rejected, (state, action) => {
        state.isConnecting = false;
        state.isConnected = false;
        state.error =
          (action.payload as ChatErrorPayload)?.error || "Connection failed";
      })

      // Send message(duplicates)
      // .addCase(sendMessage.fulfilled, (state, action) => {
      //   if (state.activeRoom) {
      //     state.activeRoom.messages.push(action.payload);
      //   }
      // })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error =
          (action.payload as ChatErrorPayload)?.error ||
          "Failed to send message";
      })

      // Disconnect from chat
      .addCase(disconnectFromChat.fulfilled, (state) => {
        state.activeRoom = null;
        state.ws = null;
        state.isConnected = false;
        state.isConnecting = false;
      })
      .addCase(disconnectFromChat.rejected, (state, action) => {
        state.error =
          (action.payload as ChatErrorPayload)?.error || "Failed to disconnect";
      });
  },
});

export const {
  setTargetUserID,
  setCurrentUserID,
  receiveMessage,
  clearError,
  resetChat,
} = chatSlice.actions;

export default chatSlice.reducer;
