// ─── App Info ──────────────────────────────────────────────────────────────
export const APP_NAME = "TaskFlow";
export const APP_VERSION = "1.0.0";
export const APP_TAGLINE = "Project Management, Simplified";

// ─── API ───────────────────────────────────────────────────────────────────
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
export const API_TIMEOUT_MS = 15000;

// ─── Local Storage Keys ────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  TOKEN: "taskflow_token",
  USER: "taskflow_user",
  THEME: "taskflow_theme",
  AUTH: "taskflow_auth",
  UI: "taskflow_ui",
};

// ─── User Roles ────────────────────────────────────────────────────────────
export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  EMPLOYEE: "employee",
};

export const ROLE_LABELS = {
  admin: "Admin",
  manager: "Manager",
  employee: "Employee",
};

export const ROLE_COLORS = {
  admin: "purple",
  manager: "blue",
  employee: "default",
};

// ─── Task Status ───────────────────────────────────────────────────────────
export const TASK_STATUS = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  REVIEW: "review",
  DONE: "done",
};

export const TASK_STATUS_LABELS = {
  todo: "To Do",
  in_progress: "In Progress",
  review: "In Review",
  done: "Done",
};

export const TASK_STATUS_COLORS = {
  todo: "default",
  in_progress: "primary",
  review: "warning",
  done: "success",
};

export const TASK_STATUS_ORDER = ["todo", "in_progress", "review", "done"];

// ─── Task Priority ─────────────────────────────────────────────────────────
export const TASK_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
};

export const TASK_PRIORITY_LABELS = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const TASK_PRIORITY_COLORS = {
  low: "default",
  medium: "warning",
  high: "orange",
  critical: "danger",
};

export const TASK_PRIORITY_ORDER = ["low", "medium", "high", "critical"];

// ─── Project Status ────────────────────────────────────────────────────────
export const PROJECT_STATUS = {
  PLANNING: "planning",
  ACTIVE: "active",
  ON_HOLD: "on_hold",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export const PROJECT_STATUS_LABELS = {
  planning: "Planning",
  active: "Active",
  on_hold: "On Hold",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const PROJECT_STATUS_COLORS = {
  planning: "info",
  active: "success",
  on_hold: "warning",
  completed: "primary",
  cancelled: "danger",
};

// ─── Project Priority ──────────────────────────────────────────────────────
export const PROJECT_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
};

// ─── Pagination ────────────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

// ─── Date Formats ──────────────────────────────────────────────────────────
export const DATE_FORMAT = "MMM DD, YYYY";
export const DATE_TIME_FORMAT = "MMM DD, YYYY HH:mm";
export const TIME_FORMAT = "HH:mm";

// ─── Notification Types ────────────────────────────────────────────────────
export const NOTIFICATION_TYPES = {
  TASK_ASSIGNED: "task_assigned",
  TASK_UPDATED: "task_updated",
  TASK_COMPLETED: "task_completed",
  TASK_DUE_SOON: "task_due_soon",
  TASK_OVERDUE: "task_overdue",
  PROJECT_CREATED: "project_created",
  PROJECT_UPDATED: "project_updated",
  MEMBER_ADDED: "member_added",
  COMMENT_ADDED: "comment_added",
  MENTION: "mention",
};

// ─── Socket Events ─────────────────────────────────────────────────────────
export const SOCKET_EVENTS = {
  // Tasks
  TASK_CREATED: "task:created",
  TASK_UPDATED: "task:updated",
  TASK_DELETED: "task:deleted",
  TASK_STATUS_CHANGED: "task:status_changed",
  // Projects
  PROJECT_UPDATED: "project:updated",
  MEMBER_JOINED: "project:member_joined",
  // Notifications
  NOTIFICATION: "notification",
  // Rooms
  JOIN_ROOM: "join_room",
  LEAVE_ROOM: "leave_room",
};

// ─── Chart Colors ──────────────────────────────────────────────────────────
export const CHART_COLORS = {
  primary: "#3b82f6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  purple: "#8b5cf6",
  cyan: "#06b6d4",
  pink: "#ec4899",
  orange: "#f97316",
  slate: "#64748b",
};

export const CHART_COLOR_ARRAY = Object.values(CHART_COLORS);

// ─── File Upload ────────────────────────────────────────────────────────────
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
export const ALLOWED_DOC_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

// ─── Validation Limits ─────────────────────────────────────────────────────
export const LIMITS = {
  NAME_MAX: 80,
  TITLE_MAX: 120,
  DESCRIPTION_MAX: 1000,
  COMMENT_MAX: 500,
  TAG_MAX_COUNT: 6,
  TAG_MAX_LENGTH: 20,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 128,
};

// ─── Debounce Delays ───────────────────────────────────────────────────────
export const DEBOUNCE = {
  SEARCH: 400,
  AUTOSAVE: 1000,
  RESIZE: 200,
};
