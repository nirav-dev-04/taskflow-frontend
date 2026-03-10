import { getSocket, emit } from "./socketClient";

// ─────────────────────────────────────────────────────────────────────────────
// EVENT NAME CONSTANTS
// Single source of truth — import these instead of using raw strings.
// ─────────────────────────────────────────────────────────────────────────────

// ── Connection ───────────────────────────────────────────────────────────────
export const SOCKET_EVENTS = {
  // ── Connection ─────────────────────────────────────────────────────────────
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  CONNECT_ERROR: "connect_error",
  RECONNECT: "reconnect",
  RECONNECT_FAILED: "reconnect_failed",

  // ── Rooms ──────────────────────────────────────────────────────────────────
  JOIN_ROOM: "join_room",
  LEAVE_ROOM: "leave_room",

  // ── Tasks ──────────────────────────────────────────────────────────────────
  TASK_CREATED: "task:created",
  TASK_UPDATED: "task:updated",
  TASK_DELETED: "task:deleted",
  TASK_STATUS_CHANGED: "task:status_changed",
  TASK_ASSIGNED: "task:assigned",
  TASK_COMMENT_ADDED: "task:comment_added",

  // ── Projects ───────────────────────────────────────────────────────────────
  PROJECT_CREATED: "project:created",
  PROJECT_UPDATED: "project:updated",
  PROJECT_DELETED: "project:deleted",
  PROJECT_MEMBER_ADDED: "project:member_added",
  PROJECT_MEMBER_REMOVED: "project:member_removed",

  // ── Sprints ────────────────────────────────────────────────────────────────
  SPRINT_CREATED: "sprint:created",
  SPRINT_UPDATED: "sprint:updated",
  SPRINT_DELETED: "sprint:deleted",

  // ── Notifications ──────────────────────────────────────────────────────────
  NOTIFICATION: "notification",
  NOTIFICATION_READ: "notification:read",
  NOTIFICATION_READ_ALL: "notification:read_all",

  // ── Users ──────────────────────────────────────────────────────────────────
  USER_ONLINE: "user:online",
  USER_OFFLINE: "user:offline",
  USER_UPDATED: "user:updated",

  // ── Real-time collaboration ────────────────────────────────────────────────
  TYPING_START: "typing:start",
  TYPING_STOP: "typing:stop",

  // ── Errors ────────────────────────────────────────────────────────────────
  ERROR: "error",
};

// ─────────────────────────────────────────────────────────────────────────────
// ROOM HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Join the socket room for a specific project */
export function joinProjectRoom(projectId) {
  emit(SOCKET_EVENTS.JOIN_ROOM, { room: `project:${projectId}` });
}

/** Leave the socket room for a specific project */
export function leaveProjectRoom(projectId) {
  emit(SOCKET_EVENTS.LEAVE_ROOM, { room: `project:${projectId}` });
}

/** Join the global user notification room */
export function joinUserRoom(userId) {
  emit(SOCKET_EVENTS.JOIN_ROOM, { room: `user:${userId}` });
}

/** Leave the global user notification room */
export function leaveUserRoom(userId) {
  emit(SOCKET_EVENTS.LEAVE_ROOM, { room: `user:${userId}` });
}

// ─────────────────────────────────────────────────────────────────────────────
// EMIT HELPERS
// Typed wrappers so callers don't have to remember event names.
// ─────────────────────────────────────────────────────────────────────────────

/** Notify others that this user started typing in a task/comment */
export function emitTypingStart({ projectId, taskId, userId }) {
  emit(SOCKET_EVENTS.TYPING_START, { projectId, taskId, userId });
}

/** Notify others that this user stopped typing */
export function emitTypingStop({ projectId, taskId, userId }) {
  emit(SOCKET_EVENTS.TYPING_STOP, { projectId, taskId, userId });
}

/** Broadcast a task status change */
export function emitTaskStatusChanged({ taskId, status, projectId }) {
  emit(SOCKET_EVENTS.TASK_STATUS_CHANGED, { taskId, status, projectId });
}

// ─────────────────────────────────────────────────────────────────────────────
// LISTENER REGISTRATION HELPERS
// Each function attaches a handler to the live socket and returns a cleanup fn.
// ─────────────────────────────────────────────────────────────────────────────

function registerListener(event, handler) {
  const socket = getSocket();
  if (!socket) {
    console.warn(
      `[SocketEvents] Cannot register "${event}" — socket not connected.`,
    );
    return () => {};
  }
  socket.on(event, handler);
  return () => socket.off(event, handler);
}

// ── Task listeners ────────────────────────────────────────────────────────────

/** Called when any task is created in a joined project room */
export function onTaskCreated(handler) {
  return registerListener(SOCKET_EVENTS.TASK_CREATED, handler);
}
/** Called when any task is updated */
export function onTaskUpdated(handler) {
  return registerListener(SOCKET_EVENTS.TASK_UPDATED, handler);
}
/** Called when any task is deleted */
export function onTaskDeleted(handler) {
  return registerListener(SOCKET_EVENTS.TASK_DELETED, handler);
}
/** Called when a task's status changes (useful for live Kanban) */
export function onTaskStatusChanged(handler) {
  return registerListener(SOCKET_EVENTS.TASK_STATUS_CHANGED, handler);
}
/** Called when a task is assigned to someone */
export function onTaskAssigned(handler) {
  return registerListener(SOCKET_EVENTS.TASK_ASSIGNED, handler);
}
/** Called when a comment is added to a task */
export function onTaskCommentAdded(handler) {
  return registerListener(SOCKET_EVENTS.TASK_COMMENT_ADDED, handler);
}

// ── Project listeners ─────────────────────────────────────────────────────────

export function onProjectCreated(handler) {
  return registerListener(SOCKET_EVENTS.PROJECT_CREATED, handler);
}
export function onProjectUpdated(handler) {
  return registerListener(SOCKET_EVENTS.PROJECT_UPDATED, handler);
}
export function onProjectDeleted(handler) {
  return registerListener(SOCKET_EVENTS.PROJECT_DELETED, handler);
}
export function onProjectMemberAdded(handler) {
  return registerListener(SOCKET_EVENTS.PROJECT_MEMBER_ADDED, handler);
}
export function onProjectMemberRemoved(handler) {
  return registerListener(SOCKET_EVENTS.PROJECT_MEMBER_REMOVED, handler);
}

// ── Notification listeners ────────────────────────────────────────────────────

/** Called when the server pushes a new notification to this user */
export function onNotification(handler) {
  return registerListener(SOCKET_EVENTS.NOTIFICATION, handler);
}
export function onNotificationRead(handler) {
  return registerListener(SOCKET_EVENTS.NOTIFICATION_READ, handler);
}
export function onNotificationReadAll(handler) {
  return registerListener(SOCKET_EVENTS.NOTIFICATION_READ_ALL, handler);
}

// ── User presence listeners ───────────────────────────────────────────────────

export function onUserOnline(handler) {
  return registerListener(SOCKET_EVENTS.USER_ONLINE, handler);
}
export function onUserOffline(handler) {
  return registerListener(SOCKET_EVENTS.USER_OFFLINE, handler);
}

// ── Typing listeners ──────────────────────────────────────────────────────────

export function onTypingStart(handler) {
  return registerListener(SOCKET_EVENTS.TYPING_START, handler);
}
export function onTypingStop(handler) {
  return registerListener(SOCKET_EVENTS.TYPING_STOP, handler);
}

// ── Sprint listeners ──────────────────────────────────────────────────────────

export function onSprintCreated(handler) {
  return registerListener(SOCKET_EVENTS.SPRINT_CREATED, handler);
}
export function onSprintUpdated(handler) {
  return registerListener(SOCKET_EVENTS.SPRINT_UPDATED, handler);
}
export function onSprintDeleted(handler) {
  return registerListener(SOCKET_EVENTS.SPRINT_DELETED, handler);
}

// ── Error listener ────────────────────────────────────────────────────────────

export function onSocketError(handler) {
  return registerListener(SOCKET_EVENTS.ERROR, handler);
}

// ─────────────────────────────────────────────────────────────────────────────
// BULK CLEANUP HELPER
// Pass an array of cleanup functions returned from the on* helpers above.
//
// Usage:
//   const cleanups = [
//     onTaskCreated(handleCreate),
//     onTaskUpdated(handleUpdate),
//   ];
//   return () => cleanupSocketListeners(cleanups);
// ─────────────────────────────────────────────────────────────────────────────
export function cleanupSocketListeners(cleanupFns = []) {
  cleanupFns.forEach((fn) => typeof fn === "function" && fn());
}

export default SOCKET_EVENTS;
