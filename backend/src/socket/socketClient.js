import { io } from "socket.io-client";
import { STORAGE_KEYS } from "../utils/constants";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL?.replace("/api", "") ||
  "http://localhost:5000";

// ── Singleton instance ─────────────────────────────────────────────────────
let socket = null;

// ── Connection options ─────────────────────────────────────────────────────
const SOCKET_OPTIONS = {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 10000,
  autoConnect: false, // we control when to connect
};

// ─────────────────────────────────────────────────────────────────────────────
// connect — call after login / when token is available
// ─────────────────────────────────────────────────────────────────────────────
export function connectSocket(token) {
  // Already connected — skip
  if (socket?.connected) return socket;

  // Tear down stale instance
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  const authToken = token || localStorage.getItem(STORAGE_KEYS.TOKEN);

  if (!authToken) {
    console.warn("[SocketClient] No auth token — connection aborted.");
    return null;
  }

  socket = io(SOCKET_URL, {
    ...SOCKET_OPTIONS,
    auth: { token: authToken },
  });

  socket.connect();

  // ── Built-in lifecycle logging ───────────────────────────────────────────
  socket.on("connect", () => {
    console.info(
      `[SocketClient] Connected  ▸ id=${socket.id}  transport=${socket.io.engine.transport.name}`,
    );

    // Log transport upgrades (polling → websocket)
    socket.io.engine.on("upgrade", (t) => {
      console.info(`[SocketClient] Upgraded   ▸ transport=${t.name}`);
    });
  });

  socket.on("disconnect", (reason) => {
    console.info(`[SocketClient] Disconnected ▸ reason=${reason}`);

    // Server-side disconnect — reconnect manually
    if (reason === "io server disconnect") {
      socket.connect();
    }
  });

  socket.on("connect_error", (err) => {
    console.warn(`[SocketClient] Connect error ▸ ${err.message}`);
  });

  socket.on("reconnect", (attempt) => {
    console.info(`[SocketClient] Reconnected  ▸ attempt=${attempt}`);
  });

  socket.on("reconnect_failed", () => {
    console.error("[SocketClient] Reconnection failed — giving up.");
  });

  return socket;
}

// ─────────────────────────────────────────────────────────────────────────────
// disconnect — call on logout
// ─────────────────────────────────────────────────────────────────────────────
export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    console.info("[SocketClient] Disconnected manually.");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// getSocket — returns the current instance (null if not connected)
// ─────────────────────────────────────────────────────────────────────────────
export function getSocket() {
  return socket;
}

// ─────────────────────────────────────────────────────────────────────────────
// isConnected — quick boolean check
// ─────────────────────────────────────────────────────────────────────────────
export function isConnected() {
  return socket?.connected ?? false;
}

// ─────────────────────────────────────────────────────────────────────────────
// emit — safe emit (no-op when disconnected)
// ─────────────────────────────────────────────────────────────────────────────
export function emit(event, data, ack) {
  if (!socket?.connected) {
    console.warn(`[SocketClient] Cannot emit "${event}" — not connected.`);
    return false;
  }
  ack ? socket.emit(event, data, ack) : socket.emit(event, data);
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// on / off — event subscription helpers
// ─────────────────────────────────────────────────────────────────────────────
export function on(event, callback) {
  socket?.on(event, callback);
}

export function off(event, callback) {
  socket?.off(event, callback);
}

// ─────────────────────────────────────────────────────────────────────────────
// Rooms
// ─────────────────────────────────────────────────────────────────────────────
export function joinRoom(room) {
  emit("join_room", { room });
}

export function leaveRoom(room) {
  emit("leave_room", { room });
}

export default {
  connect: connectSocket,
  disconnect: disconnectSocket,
  getSocket,
  isConnected,
  emit,
  on,
  off,
  joinRoom,
  leaveRoom,
};
