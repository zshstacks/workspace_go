import { useCallback, useEffect } from "react";
import {
  clearError,
  receiveMessage,
  resetChat,
  setCurrentUserID,
  setTargetUserID,
} from "../redux/slices/chatSlice/chatSlice";
import {
  connectToChat,
  disconnectFromChat,
  sendMessage,
} from "../redux/slices/chatSlice/asyncActions";
import { ChatState, Message } from "../utility/types/reduxTypes";

import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";

export const useAppDispatch = () => useDispatch<AppDispatch>();

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useChat = () => {
  const dispatch = useAppDispatch();
  const chatState = useAppSelector((state) => state.chat as ChatState);

  // WebSocket event listener setup
  useEffect(() => {
    if (chatState.ws) {
      const handleMessage = (event: MessageEvent) => {
        try {
          const message: Message = JSON.parse(event.data);
          dispatch(receiveMessage(message));
        } catch {
          console.error("Incoming message parsing error");
        }
      };
      const handleClose = () => dispatch(resetChat());
      const handleError = (err: Event) => console.error("WebSocket error", err);

      chatState.ws.addEventListener("message", handleMessage);
      chatState.ws.addEventListener("close", handleClose);
      chatState.ws.addEventListener("error", handleError);

      return () => {
        chatState.ws?.removeEventListener("message", handleMessage);
        chatState.ws?.removeEventListener("close", handleClose);
        chatState.ws?.removeEventListener("error", handleError);
      };
    }
  }, [chatState.ws, dispatch]);

  const connectToUserChat = useCallback(
    (currentUserID: string, targetUserID: string) => {
      dispatch(setCurrentUserID(currentUserID));
      dispatch(setTargetUserID(targetUserID));
      dispatch(connectToChat({ currentUserID, targetUserID }));
    },
    [dispatch]
  );

  const sendChatMessage = useCallback(
    (body: string) => {
      if (chatState.currentUserID && chatState.targetUserID) {
        dispatch(
          sendMessage({
            senderID: chatState.currentUserID,
            receiverID: chatState.targetUserID,
            body,
          })
        );
      }
    },
    [dispatch, chatState.currentUserID, chatState.targetUserID]
  );

  const disconnectChat = useCallback(() => {
    dispatch(disconnectFromChat());
  }, [dispatch]);

  const updateTargetUserID = useCallback(
    (userID: string) => {
      dispatch(setTargetUserID(userID));
    },
    [dispatch]
  );

  const clearChatError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    ...chatState,
    connectToUserChat,
    sendChatMessage,
    disconnectChat,
    updateTargetUserID,
    clearChatError,
  };
};
