"use client";

import React from "react";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { ToastContainer } from "react-toastify";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      {children}
      <ToastContainer toastStyle={{ zIndex: 100000 }} />
    </Provider>
  );
}
