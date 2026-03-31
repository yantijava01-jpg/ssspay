import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { SettingsProvider } from "./context/SettingsContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <SettingsProvider>
            <App />
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: "#1a1a24",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  fontSize: "14px",
                  padding: "12px 16px",
                  maxWidth: "360px",
                },
                success: {
                  iconTheme: { primary: "#f59e0b", secondary: "#1a1a24" },
                },
                error: {
                  iconTheme: { primary: "#ef4444", secondary: "#fff" },
                },
              }}
            />
          </SettingsProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
