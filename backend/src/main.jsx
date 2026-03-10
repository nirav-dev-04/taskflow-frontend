import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { NotificationProvider } from "./context/NotificationContext";
import "./styles/index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          {/* SocketProvider must be inside AuthProvider so it can read the token */}
          <SocketProvider>
            {/* NotificationProvider must be inside SocketProvider so it can receive push events */}
            <NotificationProvider>
              <App />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: "#12121f",
                    color: "#e8e8f0",
                    border: "1px solid #1e1e30",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontFamily: "DM Sans, sans-serif",
                  },
                  success: {
                    iconTheme: {
                      primary: "#22c55e",
                      secondary: "#12121f",
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: "#ef4444",
                      secondary: "#12121f",
                    },
                  },
                }}
              />
            </NotificationProvider>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
