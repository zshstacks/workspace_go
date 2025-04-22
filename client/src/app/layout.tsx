"use client";

import { Provider } from "react-redux";
import { store } from "./redux/store";
import { ToastContainer } from "react-toastify";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="relative">
        <Provider store={store}>
          {children}
          <ToastContainer toastStyle={{ zIndex: 100000 }} />
        </Provider>
      </body>
    </html>
  );
}
