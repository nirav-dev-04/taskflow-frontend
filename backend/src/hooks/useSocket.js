import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./useAuth";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

/**
 * Manages a Socket.IO connection tied to the authenticated user.
 *
 * Returns:
 *   socket, isConnected, on(event, cb), off(event, cb),
 *   emit(event, data), joinRoom(room), leaveRoom(room)
 */
export function useSocket() {
  const { token, isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));
    socket.on("connect_error", (err) => {
      console.warn("[Socket] Connection error:", err.message);
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [isAuthenticated, token]);

  /** Subscribe to a socket event. Auto-cleans up on unmount. */
  const on = useCallback((event, callback) => {
    socketRef.current?.on(event, callback);
    return () => socketRef.current?.off(event, callback);
  }, []);

  /** Unsubscribe from a socket event. */
  const off = useCallback((event, callback) => {
    socketRef.current?.off(event, callback);
  }, []);

  /** Emit a socket event with optional data. */
  const emit = useCallback((event, data) => {
    if (!socketRef.current?.connected) {
      console.warn(
        `[Socket] Tried to emit "${event}" but socket is not connected.`,
      );
      return;
    }
    socketRef.current.emit(event, data);
  }, []);

  /** Join a socket room (e.g. project room). */
  const joinRoom = useCallback(
    (room) => {
      emit("join_room", { room });
    },
    [emit],
  );

  /** Leave a socket room. */
  const leaveRoom = useCallback(
    (room) => {
      emit("leave_room", { room });
    },
    [emit],
  );

  return {
    socket: socketRef.current,
    isConnected,
    on,
    off,
    emit,
    joinRoom,
    leaveRoom,
  };
}

/**
 * Convenience hook: subscribe to a socket event for the lifetime of the component.
 *
 * Usage:
 *   useSocketEvent("task_updated", (data) => updateTask(data));
 */
export function useSocketEvent(event, callback) {
  const { on } = useSocket();

  useEffect(() => {
    if (!event || !callback) return;
    const cleanup = on(event, callback);
    return cleanup;
  }, [event, callback, on]);
}
