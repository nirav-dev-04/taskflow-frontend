import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import { useAuthStore } from "../store/authSlice";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL?.replace("/api", "") ||
  "http://localhost:5000";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { token, isAuthenticated } = useAuthStore();
  const socketRef = useRef(null);
  const listenersRef = useRef({}); // { event: Set<callback> }
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState(null);

  // ── Connect / Disconnect ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !token) {
      // Clean up if user logs out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
        setTransport(null);
      }
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      // Upgrade event
      socket.io.engine.on("upgrade", (t) => setTransport(t.name));

      // Re-attach any stored listeners (e.g. after reconnect)
      Object.entries(listenersRef.current).forEach(([event, cbs]) => {
        cbs.forEach((cb) => socket.on(event, cb));
      });
    });

    socket.on("disconnect", (reason) => {
      setIsConnected(false);
      if (reason === "io server disconnect") {
        // Server closed — try to reconnect manually
        socket.connect();
      }
    });

    socket.on("connect_error", (err) => {
      console.warn("[Socket] Connection error:", err.message);
      setIsConnected(false);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setTransport(null);
    };
  }, [isAuthenticated, token]);

  // ── on ─────────────────────────────────────────────────────────────────────
  /**
   * Subscribe to a socket event.
   * Returns an unsubscribe function.
   */
  const on = useCallback((event, callback) => {
    // Register in ref (so we can re-attach after reconnect)
    if (!listenersRef.current[event]) listenersRef.current[event] = new Set();
    listenersRef.current[event].add(callback);

    // Attach if socket already exists
    socketRef.current?.on(event, callback);

    // Return cleanup
    return () => {
      listenersRef.current[event]?.delete(callback);
      socketRef.current?.off(event, callback);
    };
  }, []);

  // ── off ────────────────────────────────────────────────────────────────────
  const off = useCallback((event, callback) => {
    listenersRef.current[event]?.delete(callback);
    socketRef.current?.off(event, callback);
  }, []);

  // ── emit ───────────────────────────────────────────────────────────────────
  const emit = useCallback((event, data, ack) => {
    if (!socketRef.current?.connected) {
      console.warn(`[Socket] Cannot emit "${event}" — not connected.`);
      return false;
    }
    if (ack) {
      socketRef.current.emit(event, data, ack);
    } else {
      socketRef.current.emit(event, data);
    }
    return true;
  }, []);

  // ── Rooms ──────────────────────────────────────────────────────────────────
  const joinRoom = useCallback(
    (room) => {
      emit("join_room", { room });
    },
    [emit],
  );

  const leaveRoom = useCallback(
    (room) => {
      emit("leave_room", { room });
    },
    [emit],
  );

  // ── Manual reconnect ───────────────────────────────────────────────────────
  const reconnect = useCallback(() => {
    if (socketRef.current && !socketRef.current.connected) {
      socketRef.current.connect();
    }
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        transport,
        on,
        off,
        emit,
        joinRoom,
        leaveRoom,
        reconnect,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────
export function useSocketContext() {
  const ctx = useContext(SocketContext);
  if (!ctx)
    throw new Error("useSocketContext must be used within a SocketProvider");
  return ctx;
}

/**
 * Convenience hook: subscribe to a socket event for the component's lifetime.
 *
 * Usage:
 *   useSocketEvent("task:updated", (data) => updateTask(data));
 */
export function useSocketEvent(event, callback, deps = []) {
  const { on } = useSocketContext();

  useEffect(() => {
    if (!event || !callback) return;
    const cleanup = on(event, callback);
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, on, ...deps]);
}

export default SocketContext;
